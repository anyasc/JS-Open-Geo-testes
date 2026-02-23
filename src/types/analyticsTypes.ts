export interface AnalyticsCounters {
  // Acesso
  pageview: number;
  unique_daily_view: number;
  extraction_page_view: number;
  palitos_page_view: number;
  cadsig_tools_page_view: number;
  about_page_view: number;
  changelog_page_view: number;

  // Dados de sondagem
  extract_preview: number;
  export_json: number;
  export_excel: number;
  export_csv: number;
  export_leapfrog_zip: number;
  export_leapfrog_collar: number;
  export_leapfrog_nspt: number;
  export_leapfrog_na: number;
  export_leapfrog_geology: number;
  export_leapfrog_interp: number;
  export_ags: number;
  extraction_presets_view: number;
  extraction_presets_load: number;
  extraction_presets_save: number;
  extraction_presets_download: number;
  extraction_presets_import: number;
  extraction_map_view: number;
  extraction_map_insert_data: number;
  extraction_map_export: number;
  extraction_exclude_page_open: number;
  extraction_exclude_page_use: number;

  // Palitos
  generate_dxf_count: number;
  generate_dxf_sondagens: number;
  extracted_data_to_palito: number;
  leapfrog_to_palito: number;

  // Ferramentas CAD/SIG
  dxf_tools_view: number; // adicionar
  dxf_tools_save_dxf: number; // adicionar
  dxf_tools_save_xlsx: number; // adicionar
  dxf_tools_save_kml: number; // adicionar
  distance_tool_view: number; // adicionar
  distance_tool_save: number; // adicionar
  kml_to_xlsx_view: number; // adicionar
  kml_to_xlsx_save: number; // adicionar
  xlsx_to_dxf_profile_view: number; // adicionar
  xlsx_to_dxf_profile_save: number; // adicionar
  xlsx_to_kml_view: number; // adicionar
  xlsx_to_kml_save: number; // adicionar
  cadsig_open_templates: number; // adicionar

  dxf_tools: number;

  distance_tool: number;

  xlsx_to_kml: number;

  xlsx_to_dxf_profile: number;

  kml_to_xlsx: number;
}

export type AnalyticsEvent = keyof AnalyticsCounters;
