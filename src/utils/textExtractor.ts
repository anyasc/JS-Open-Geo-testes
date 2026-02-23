import { createWorker } from "tesseract.js";
import type { TextItem } from "react-pdf";
import type {
  Area,
  ExtractionProgress,
  HorizontalLine,
  PageTextData,
} from "../types";
import {
  convertCoordinates,
  filterTextContent,
  formatDataByType,
  isUniqueValueType,
  nsptToString,
  textItemToString,
} from "./helpers";
import {
  ocrExtractLines,
  pdfPageToCanvas,
  processOCRLines,
} from "./ocrExtractor";

export const extractText = async (
  areas: Area[],
  pdfDocument: any,
  excludedPages: Set<number>,
  abortSignal?: AbortSignal,
  onProgress?: (progress: ExtractionProgress) => void,
): Promise<PageTextData[]> => {
  const checkAborted = () => {
    if (abortSignal?.aborted) {
      throw new Error("Extração cancelada pelo usuário");
    }
  };
  onProgress?.({
    stage: "starting",
    message: "Iniciando extração...",
  });

  const extractedTexts: PageTextData[] = [];
  const mandatoryAreas = areas.filter(
    (area) => area.isMandatory && area.coordinates,
  );
  const numPages = pdfDocument.numPages;
  const holeIdArea = areas.find((area) => area.dataType === "hole_id");
  const nonRepeatDataAreas = areas.filter(
    (area) => !area.repeatInPages && area.dataType !== "hole_id",
  );

  const needsOCR = areas.some((area) => area.ocr);
  const worker = needsOCR ? await createWorker("por") : null;

  checkAborted();

  try {
    // Cache de canvas por página (apenas se precisar de OCR)
    let pageCanvasCache: Map<number, HTMLCanvasElement> | null = null;
    let getPageCanvas:
      | ((page: any, pageNum: number) => Promise<HTMLCanvasElement>)
      | null = null;

    if (needsOCR) {
      pageCanvasCache = new Map<number, HTMLCanvasElement>();

      getPageCanvas = async (
        page: any,
        pageNum: number,
      ): Promise<HTMLCanvasElement> => {
        if (pageCanvasCache!.has(pageNum)) {
          return pageCanvasCache!.get(pageNum)!;
        }

        const viewport2x = page.getViewport({ scale: 2 });
        const canvas = await pdfPageToCanvas(page, viewport2x);
        pageCanvasCache!.set(pageNum, canvas);
        return canvas;
      };
    }

    checkAborted();

    const hasRequiredData = async (pageNum: number) => {
      if (mandatoryAreas.length === 0) return true; // Se não tem obrigatórios, todas as páginas servem
      const page = await pdfDocument.getPage(pageNum);
      const originalViewport = page.getViewport({ scale: 1 });
      const pageTexts = await page.getTextContent();

      for (const area of mandatoryAreas) {
        if (area.ocr) {
          // Verificar áreas obrigatórias com ocr
          if (!page || !worker || !area.coordinates) continue;
          const dataLines = await ocrExtractLines(
            area.coordinates,
            page,
            worker,
          );
          if (dataLines.every((line) => !line.text.trim())) return false;
        } else {
          // Verificar áreas obrigatórias com texto normal
          const pageCoordinates = convertCoordinates(
            area.coordinates!,
            1,
            1,
            originalViewport,
          );
          const filteredItems = filterTextContent(pageTexts, pageCoordinates);
          const textContent = textItemToString(filteredItems, [])
            .join(" ")
            .trim();

          if (!textContent) return false;
        }
      }
      return true;
    };

    const validPages: number[] = [];
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (excludedPages.has(pageNum)) continue;
      checkAborted();
      onProgress?.({
        stage: "validating",
        message: `Verificando páginas obrigatórias ${pageNum}/${numPages}`,
      });
      if (await hasRequiredData(pageNum)) {
        validPages.push(pageNum);
      }
    }

    // Extração específica para quando há hole_id
    if (holeIdArea && holeIdArea.coordinates) {
      const holeIdName = holeIdArea.name;
      const holeIdsPerPage: { page: number; holeId: string }[] = [];
      const pagesWithoutId: number[] = [];
      const uniqueHoleIds: string[] = [];

      // Extraindo os hole_id e identificando as páginas nos quais se repetem
      let holePageIndex = 0;
      for (const pageNum of validPages) {
        checkAborted();
        holePageIndex++;
        onProgress?.({
          stage: "hole_ids",
          message: `Extraindo IDs de sondagem da página ${holePageIndex}/${validPages.length}`,
        });
        const page = await pdfDocument.getPage(pageNum);
        let holeIdText = "";

        if (holeIdArea.ocr) {
          if (!worker) continue;
          const dataLines = await ocrExtractLines(
            holeIdArea.coordinates,
            page,
            worker,
          );
          holeIdText = dataLines
            .map((line) => line.text.trim())
            .filter((text) => text)
            .join(" ")
            .trim();
        } else {
          const pageTexts = await page.getTextContent();
          const originalViewport = page.getViewport({ scale: 1 });

          const pageCoordinates = convertCoordinates(
            holeIdArea.coordinates,
            1,
            1,
            originalViewport,
          );
          const filteredItems = filterTextContent(pageTexts, pageCoordinates);
          filteredItems.sort(
            (a: { transform: number[] }, b: { transform: number[] }) =>
              b.transform[5] - a.transform[5],
          );
          holeIdText = textItemToString(filteredItems, []).join(" ").trim();
        }
        holeIdsPerPage.push({ page: pageNum, holeId: holeIdText });

        if (holeIdText) {
          const existingEntry = extractedTexts.find(
            (textItem) =>
              textItem[holeIdName] &&
              Array.isArray(textItem[holeIdName]) &&
              textItem[holeIdName][0] === holeIdText,
          );

          if (existingEntry) {
            existingEntry.pageNumber.push(pageNum);
          } else {
            uniqueHoleIds.push(holeIdText);
            extractedTexts.push({
              pageNumber: [pageNum],
              [holeIdName]: [holeIdText],
            });
          }
        } else {
          pagesWithoutId.push(pageNum);
        }
      }

      const repeatDataAreas = areas.filter((area) => area.repeatInPages);

      // Adicionando textos que repetem entre páginas
      if (repeatDataAreas.length > 0) {
        // Loop para localizar textos em cada primeira página de sondagem
        let repeatEntryIndex = 0;
        for (const entry of extractedTexts) {
          checkAborted();
          repeatEntryIndex++;
          onProgress?.({
            stage: "repeat_areas",
            message: `Processando áreas únicas da sondagem ${repeatEntryIndex}/${extractedTexts.length}`,
          });
          const firstPage = entry.pageNumber[0];
          const page = await pdfDocument.getPage(firstPage);
          const operatorList = await page.getOperatorList();
          const pageTexts = await page.getTextContent();
          const originalViewport = page.getViewport({ scale: 1 });
          const pageHorizontalLines = findHorizontalLines(operatorList);

          const viewport2x = page.getViewport({ scale: 2 });
          const pageCanvas = getPageCanvas
            ? await getPageCanvas(page, firstPage)
            : await pdfPageToCanvas(page, viewport2x);

          for (const area of repeatDataAreas) {
            if (area.coordinates) {
              try {
                let textArr: string[] = [];
                if (area.ocr) {
                  if (!worker) continue;
                  const dataLines = await ocrExtractLines(
                    area.coordinates,
                    page,
                    worker,
                    pageCanvas,
                  );
                  textArr = processOCRLines(dataLines, area.dataType);
                } else {
                  const pageCoordinates = convertCoordinates(
                    area.coordinates,
                    1,
                    1,
                    originalViewport,
                  );
                  const filteredTexts = filterTextContent(
                    pageTexts,
                    pageCoordinates,
                  );
                  filteredTexts.sort(
                    (a: TextItem, b: TextItem) =>
                      b.transform[5] - a.transform[5],
                  );

                  textArr =
                    area.dataType === "nspt"
                      ? nsptToString(filteredTexts)
                      : textItemToString(filteredTexts, pageHorizontalLines);
                }
                entry[area.name] = formatDataByType(textArr, area.dataType);
              } catch (error) {
                console.error(`Erro ao processar área ${area.name}: ${error}`);
                entry[area.name] = [];
              }
            }
          }
        }
      }
    } else {
      for (const pageNum of validPages) {
        extractedTexts.push({
          pageNumber: [pageNum],
        });
      }
    }

    // Processando dados que não repetem em páginas diferentes da mesma sondagem
    // A mesma lógica é aplicada para quando não há hole_id
    if (nonRepeatDataAreas.length > 0) {
      let nonRepeatEntryIndex = 0;
      for (const textEntry of extractedTexts) {
        nonRepeatEntryIndex++;
        let entryPageIndex = 0;
        for (const entryPage of textEntry.pageNumber) {
          checkAborted();
          entryPageIndex++;
          onProgress?.({
            stage: "non_repeat_areas",
            message: `Processando áreas não únicas da sondagem ${nonRepeatEntryIndex}/${extractedTexts.length}, página ${entryPageIndex}/${textEntry.pageNumber.length} ...`,
          });
          const page = await pdfDocument.getPage(entryPage);
          const operatorList = await page.getOperatorList();
          const pageTexts = await page.getTextContent();
          const originalViewport = page.getViewport({ scale: 1 });
          const pageHorizontalLines = findHorizontalLines(operatorList);
          const viewport2x = page.getViewport({ scale: 2 });
          const pageCanvas = getPageCanvas
            ? await getPageCanvas(page, entryPage)
            : await pdfPageToCanvas(page, viewport2x);

          for (const area of nonRepeatDataAreas) {
            if (area.coordinates) {
              try {
                let textArr: string[] = [];
                if (area.ocr) {
                  if (!worker) continue;
                  const dataLines = await ocrExtractLines(
                    area.coordinates,
                    page,
                    worker,
                    pageCanvas,
                  );
                  textArr = processOCRLines(dataLines, area.dataType);
                } else {
                  const pageCoordinates = convertCoordinates(
                    area.coordinates,
                    1,
                    1,
                    originalViewport,
                  );
                  const filteredTexts = filterTextContent(
                    pageTexts,
                    pageCoordinates,
                  );
                  filteredTexts.sort(
                    (a: TextItem, b: TextItem) =>
                      b.transform[5] - a.transform[5],
                  );

                  textArr =
                    area.dataType === "nspt"
                      ? nsptToString(filteredTexts)
                      : textItemToString(filteredTexts, pageHorizontalLines);
                }
                const formattedData = formatDataByType(textArr, area.dataType);

                if (!textEntry[area.name]) {
                  textEntry[area.name] = [];
                }
                const currentTexts = textEntry[area.name] as string[];
                // Para tipos únicos, substitui o valor existente
                if (isUniqueValueType(area.dataType)) {
                  if (formattedData.length > 0) {
                    textEntry[area.name] = formattedData; // substitui
                  }
                } else {
                  // Para tipos array, adiciona evitando duplicações
                  const newTexts = [...formattedData];
                  if (currentTexts.length > 0 && newTexts.length > 0) {
                    const lastExisting = currentTexts[currentTexts.length - 1]
                      .trim()
                      .toLowerCase()
                      .replace(/\s+/g, " ");
                    const firstNew = newTexts[0]
                      .trim()
                      .toLowerCase()
                      .replace(/\s+/g, " ");

                    if (lastExisting === firstNew) {
                      newTexts.shift();
                    }
                  }

                  currentTexts.push(...newTexts);
                }
              } catch (error) {
                console.error(`Erro ao processar área ${area.name}:`, error);
              }
            }
          }
        }
      }
    }
    onProgress?.({
      stage: "complete",
      message: "Finalizando extração...",
    });
    return extractedTexts;
  } finally {
    if (worker) await worker.terminate();
  }
};

const findHorizontalLines = (operatorList: any): HorizontalLine[] => {
  const horizontalLines: HorizontalLine[] = [];

  for (let i = 0; i < operatorList.fnArray.length; i++) {
    if (operatorList.fnArray[i] === 91) {
      const pathData = operatorList.argsArray[i][1][0];

      for (let j = 0; j < pathData.length; j++) {
        if (pathData[j] === 1 && j >= 2) {
          const x1 = pathData[j - 2];
          const y1 = pathData[j - 1];
          const x2 = pathData[j + 1];
          const y2 = pathData[j + 2];

          if (Math.abs(y1 - y2) < 2) {
            // É linha horizontal
            horizontalLines.push({
              x1: Math.min(x1, x2),
              x2: Math.max(x1, x2),
              y: y1,
            });
          }
        }
      }
    }
  }

  return horizontalLines;
};
