// Objeto de seleção de área retangular
export interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Area {
  id: string;
  name: string;
  order: number;
  color: string;
  coordinates: SelectionArea | null;
  isSelected?: boolean;
  isMandatory: boolean;
  dataType?: DataType;
  repeatInPages?: boolean;
  ocr: boolean;
}

export interface AreaPreset {
  name: string;
  areas: Area[];
}

export interface PageTextData {
  pageNumber: number[];
  [areaName: string]: string[] | number[];
}

export interface HorizontalLine {
  x1: number;
  x2: number;
  y: number;
}

export const DATA_TYPES = [
  "default",
  "hole_id",
  "x",
  "y",
  "z",
  "depth",
  "date",
  "depth_from_to",
  "water_level",
  "geology",
  "nspt",
  "campaign",
  "interp",
  "generic_info",
] as const;

export type DataType = (typeof DATA_TYPES)[number];

export interface DataTypeConfig {
  valueType: "number" | "string" | "array_number" | "array_string";
  excelFormat?: string;
}

export const DATA_TYPE_CONFIGS: Record<DataType, DataTypeConfig> = {
  default: { valueType: "string" },
  hole_id: { valueType: "string" },
  x: { valueType: "number", excelFormat: "0.000" },
  y: { valueType: "number", excelFormat: "0.000" },
  z: { valueType: "number", excelFormat: "0.000" },
  depth: { valueType: "number", excelFormat: "0.00" },
  date: { valueType: "string" },
  depth_from_to: { valueType: "array_number", excelFormat: "0.00" },
  water_level: { valueType: "number", excelFormat: "0.00" },
  geology: { valueType: "array_string" },
  nspt: { valueType: "array_string" },
  campaign: { valueType: "string" },
  interp: { valueType: "array_string" },
  generic_info: { valueType: "array_string" },
};

export const DATA_TYPE_LABELS: Record<DataType, string> = {
  default: "Padrão",
  hole_id: "ID da Sondagem",
  x: "Coordenada E (X)",
  y: "Coordenada N (Y)",
  z: "Cota",
  depth: "Profundidade Total",
  date: "Data",
  depth_from_to: "Profundidades",
  water_level: "Nível d'Água",
  geology: "Descrição Geológica",
  nspt: "NSPT",
  campaign: "Campanha",
  interp: "Interpretação Geológica",
  generic_info: "Outras Informações",
};

export const REPEATING_TYPES: DataType[] = [
  "hole_id",
  "x",
  "y",
  "z",
  "depth",
  "date",
  "water_level",
  "campaign",
];
export const MANDATORY_TYPES: DataType[] = ["hole_id"];

export const UNIQUE_TYPES: DataType[] = ["hole_id", "x", "y", "z", "depth"];

export const EASY_ADD_TYPES: DataType[] = [
  "hole_id",
  "x",
  "y",
  "z",
  "depth",
  "depth_from_to",
  "geology",
  "nspt",
  "water_level",
  "interp",
];

export type ExtractionType = "text" | "ocr" | "both";

// Interface base para todos os dados do Leapfrog
export interface BaseLeapfrogData {
  "HOLE ID": string;
  [key: string]: string | number | undefined;
}

export interface CollarData extends BaseLeapfrogData {
  X: number;
  Y: number;
  Z: number;
  DEPTH: number;
  DATA?: string;
  CAMPANHA?: string;
}

// Interfaces para dados com intervalos (from/to)
export interface IntervalLeapfrogData extends BaseLeapfrogData {
  from: number;
  to: number;
}

export interface NSPTData extends IntervalLeapfrogData {
  NSPT: string;
}

export interface NAData extends IntervalLeapfrogData {
  cond: "SECO" | "ÁGUA";
}

export interface GeologyData extends IntervalLeapfrogData {
  [description: string]: string | number;
}

export interface InterpData extends IntervalLeapfrogData {
  "interp. geol": string;
}

export type LeapfrogDataTypes =
  | CollarData
  | NSPTData
  | NAData
  | GeologyData
  | InterpData;

export interface LeapfrogExportData {
  data: LeapfrogDataTypes[];
  headers: string[];
  filename: string;
}

export interface ExportValidation {
  isValid: boolean;
  missingFields: DataType[];
  errorMessage?: string;
}

export const LEAPFROG_TYPES = ["collar", "nspt", "na", "geology", "interp"];

export type LeapfrogType = (typeof LEAPFROG_TYPES)[number];

export const LEAPFROG_LABELS: Record<LeapfrogType, string> = {
  collar: "Collar",
  nspt: "NSPT",
  na: "NA",
  geology: "Geologia",
  interp: "Interpretação",
};

export const EXPORT_REQUIREMENTS: Record<LeapfrogType, string[]> = {
  collar: ["hole_id", "x", "y"],
  nspt: ["hole_id", "nspt"],
  na: ["hole_id", "water_level"],
  geology: ["hole_id", "geology", "depth_from_to"],
  interp: ["hole_id", "interp", "depth_from_to"],
};

export interface PalitoData {
  hole_id: string;
  max_depth?: number;
  x?: number;
  y?: number;
  z?: number;
  water_level?: number;
  depths: number[];
  geology: string[];
  interp?: string[];
  nspt: {
    start_depth: number;
    interval: number;
    values: string[];
  };
}

export interface ExtractionProgress {
  stage:
    | "starting"
    | "validating"
    | "hole_ids"
    | "repeat_areas"
    | "non_repeat_areas"
    | "complete";
  currentArea?: string;
  currentPage?: number;
  totalPages?: number;
  message: string;
}

export interface Cluster {
  startIndex: number;
  endIndex: number;
  layers: number[];
  totalNeeded: number;
  totalAvailable: number;
  needsExtraSpace: number;
  layerSizes: LayerSize[];
  unchanged?: boolean;
}

export interface LayerSize {
  layerIndex?: number;
  originalHeight: number;
  textHeight: number;
  finalHeight: number;
  from: number;
  to: number;
}

export interface Version {
  version: string;
  date: string;
  title: string;
  summary: string;
  features: string[];
  improvements: string[];
  bugfixes: string[];
  known_issues: string[];
}

export interface VersionsData {
  versions: Version[];
}

export interface DxfData {
  entities: any[];
  blocks: any;
  header: any;
  tables: any;
}

export interface ProfileSondagem {
  name: string;
  distance: number;
  z: number;
}

export interface AGSProjectData {
  PROJ_ID: string;
  PROJ_NAME: string;
  PROJ_LOC?: string;
  PROJ_CLNT?: string;
  PROJ_CONT?: string;
  PROJ_ENG?: string;
  PROJ_MEMO?: string;
}

export interface AGSTransmissionData {
  TRAN_ISNO?: string;
  TRAN_DATE?: string;
  TRAN_PROD: string;
  TRAN_STAT?: string;
  TRAN_AGS?: string;
  TRAN_RECV: string;
  TRAN_DESC?: string;
  TRAN_DLIM?: string;
  TRAN_RCON?: string;
}

export interface AGSAbbreviation {
  code: string;
  description: string;
  isUserDefined?: boolean;
  ignored?: boolean;
}

export interface AGSValidation {
  isValid: boolean;
  missingFields: string[];
  detectedAbbreviations: AGSAbbreviation[];
  errorMessage?: string;
}
