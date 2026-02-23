import { Download, Play, Save, Trash2, X } from "lucide-react";
import type { AreaPreset } from "@types";
import { useEffect, useState } from "react";
import { useExtractionContext } from "@/contexts/ExtractionContext";
import { analytics } from "@/utils/analyticsUtils";

interface PresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "extrator-dados-pdf-presets";

const PresetManager: React.FC<PresetManagerProps> = ({ isOpen, onClose }) => {
  const { extractionState, updateExtractionState } = useExtractionContext();
  const { areas } = extractionState;
  const [presetName, setPresetName] = useState<string>("");
  const [savedPresets, setSavedPresets] = useState<AreaPreset[]>([]);

  useEffect(() => {
    loadPresetsFromStorage();
  }, []);

  useEffect(() => {
    if (isOpen) analytics.track("extraction_presets_view");
  }, [isOpen]);

  const loadPresetsFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const presets = JSON.parse(stored);
        setSavedPresets(presets);
      }
    } catch (error) {
      console.error("Erro ao carregar presets:", error);
    }
  };
  const savePresetsToStorage = (presets: AreaPreset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error("Erro ao salvar presets:", error);
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      return;
    }
    if (areas.length <= 0) {
      alert("Não é possível salvar um preset sem áreas");
      return;
    }

    const newPreset: AreaPreset = {
      name: presetName.trim(),
      areas: areas,
    };

    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
    analytics.track("extraction_presets_save");
    setPresetName("");
  };

  const handleLoadPreset = (preset: AreaPreset) => {
    if (!confirm("Isso vai substituir todas as áreas atuais. Continuar?"))
      return;
    updateExtractionState({ areas: preset.areas });
    analytics.track("extraction_presets_load");
    onClose();
  };

  const handleDeletePreset = (index: number) => {
    if (!confirm("Tem certeza que deseja excluir este preset?")) return;

    const updatedPresets = savedPresets.filter((_, i) => i !== index);
    setSavedPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);
  };

  const handleDownloadPreset = (preset: any) => {
    const dataStr = JSON.stringify(preset, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${preset.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    analytics.track("extraction_presets_download");
  };

  const handleUploadPreset = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const uploadedPreset: AreaPreset = JSON.parse(content);

        // Validação básica
        if (!uploadedPreset.name || !Array.isArray(uploadedPreset.areas)) {
          alert("Arquivo JSON inválido!");
          return;
        }

        // Adiciona à lista e salva
        const updatedPresets = [...savedPresets, uploadedPreset];
        setSavedPresets(updatedPresets);
        savePresetsToStorage(updatedPresets);

        // Limpa o input
        event.target.value = "";

        alert(`Preset "${uploadedPreset.name}" importado com sucesso!`);
      } catch (error) {
        alert("Erro ao ler arquivo JSON!");
        console.error(error);
      }
    };

    reader.readAsText(file);
    analytics.track("extraction_presets_import");
  };

  return !isOpen ? null : (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className="position-fixed top-50 start-50 translate-middle bg-white rounded shadow-lg p-4"
        style={{
          zIndex: 1051,
          width: "500px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Gerenciar Presets</h5>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Salvar novo preset */}
        <div className="mb-4 p-3 border rounded">
          <h6>Salvar Preset Atual</h6>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Nome do preset..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
            />
            <button
              className="btn btn-success"
              onClick={handleSavePreset}
              disabled={!presetName.trim() || areas.length === 0}
            >
              <Save size={16} className="me-1" />
              Salvar
            </button>
          </div>
          <small className="text-muted">
            {areas.length === 0
              ? "Nenhuma área para salvar"
              : areas.length === 1
                ? "1 área será salva"
                : `${areas.length} áreas serão salvas`}
          </small>
        </div>

        {/* Lista de presets salvos */}
        <div className="mb-4">
          <h6>Presets Salvos</h6>
          {savedPresets.length === 0 ? (
            <p className="text-muted">Nenhum preset salvo ainda.</p>
          ) : (
            savedPresets.map((preset, index) => (
              <div
                key={index}
                className="d-flex justify-content-between align-items-center p-2 border rounded mb-2"
              >
                <div>
                  <strong>{preset.name}</strong>
                  <br />
                  <small className="text-muted">
                    {preset.areas.length} área(s)
                  </small>
                </div>
                <div className="d-flex gap-1">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleLoadPreset(preset)}
                    title="Carregar preset"
                  >
                    <Play size={14} />
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleDownloadPreset(preset)}
                    title="Download JSON"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDeletePreset(index)}
                    title="Excluir preset"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border rounded">
          <h6>Importar Preset</h6>
          <input
            type="file"
            className="form-control"
            accept=".json"
            onChange={(e) => {
              handleUploadPreset(e);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PresetManager;
