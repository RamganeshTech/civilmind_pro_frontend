    // config/boqInputForms.ts
export interface BoqInputField {
  id: string;
  label: string;
  type: 'number' | 'select';
  placeholder?: string;
  hint?: string;
  options?: { v: string; l: string }[];
}

export interface BoqInputForm {
  label: string;
  fields: BoqInputField[];
}

export const BOQ_INPUT_FORMS: Record<string, BoqInputForm> = {
  brickwork: { label: 'Brickwork', fields: [
    { id: 'length', label: 'Wall Length (ft)', type: 'number', placeholder: 'e.g. 40' },
    { id: 'height', label: 'Wall Height (ft)', type: 'number', placeholder: 'e.g. 10' },
    { id: 'thickness', label: 'Wall Thickness', type: 'select', options: [{ v: '0.75', l: '9 inch (main wall)' }, { v: '0.375', l: '4.5 inch (partition)' }] },
    { id: 'mortarRatio', label: 'Mortar Ratio', type: 'select', options: [{ v: '6', l: '1:6 (standard)' }, { v: '4', l: '1:4 (exposed)' }, { v: '3', l: '1:3 (rich)' }] },
    { id: 'waste', label: 'Wastage %', type: 'number', placeholder: '10' },
  ]},
  concrete: { label: 'Concrete Mix', fields: [
    { id: 'length', label: 'Length (ft)', type: 'number', placeholder: 'e.g. 20' },
    { id: 'width', label: 'Width (ft)', type: 'number', placeholder: 'e.g. 15' },
    { id: 'depth', label: 'Depth (inches)', type: 'number', placeholder: 'e.g. 6' },
    { id: 'grade', label: 'Concrete Grade', type: 'select', options: [{ v: 'M10', l: 'M10 (PCC)' }, { v: 'M15', l: 'M15' }, { v: 'M20', l: 'M20 (standard RCC)' }, { v: 'M25', l: 'M25' }, { v: 'M30', l: 'M30 (design mix)' }] },
    { id: 'waste', label: 'Wastage %', type: 'number', placeholder: '2' },
  ]},
  plastering: { label: 'Plastering', fields: [
    { id: 'area', label: 'Area to Plaster (sqft)', type: 'number', placeholder: 'e.g. 2400' },
    { id: 'thickness', label: 'Plaster Thickness (mm)', type: 'select', options: [{ v: '12', l: '12mm — Internal' }, { v: '15', l: '15mm — External' }, { v: '6', l: '6mm — Ceiling' }] },
    { id: 'ratio', label: 'Mortar Ratio', type: 'select', options: [{ v: '4', l: '1:4' }, { v: '6', l: '1:6' }, { v: '3', l: '1:3' }] },
  ]},
  steel: { label: 'Steel / RCC', fields: [
    { id: 'builtUpArea', label: 'Built-Up Area (sqft)', type: 'number', placeholder: 'e.g. 2400' },
    { id: 'buildingType', label: 'Building Type', type: 'select', options: [{ v: 'residential', l: 'Residential' }, { v: 'commercial', l: 'Commercial' }, { v: 'high-rise', l: 'High-Rise' }] },
  ]},
  foundation: { label: 'Foundation & PCC', fields: [
    { id: 'length', label: 'Footing Length (ft)', type: 'number', placeholder: 'e.g. 5' },
    { id: 'width', label: 'Footing Width (ft)', type: 'number', placeholder: 'e.g. 4' },
    { id: 'depth', label: 'Excavation Depth (ft)', type: 'number', placeholder: 'e.g. 5' },
    { id: 'soilType', label: 'Soil Type', type: 'select', options: [{ v: 'sandy', l: 'Sandy' }, { v: 'clay', l: 'Clay' }, { v: 'black cotton', l: 'Black Cotton' }] },
  ]},
  flooring: { label: 'Flooring & Tiling', fields: [
    { id: 'area', label: 'Floor Area (sqft)', type: 'number', placeholder: 'e.g. 800' },
    { id: 'tileType', label: 'Tile Type', type: 'select', options: [{ v: 'vitrified', l: 'Vitrified' }, { v: 'ceramic', l: 'Ceramic' }] },
    { id: 'tileSize', label: 'Tile Size', type: 'select', options: [{ v: '0.36', l: '600×600mm' }, { v: '0.16', l: '400×400mm' }, { v: '0.09', l: '300×300mm' }] },
    { id: 'waste', label: 'Wastage %', type: 'number', placeholder: '10' },
  ]},
  waterproof: { label: 'Waterproofing', fields: [
    { id: 'area', label: 'Area (sqft)', type: 'number', placeholder: 'e.g. 1200' },
    { id: 'surfaceType', label: 'Surface Type', type: 'select', options: [{ v: 'terrace', l: 'Terrace / Roof' }, { v: 'sunkSlab', l: 'Sunken Slab' }, { v: 'toilet', l: 'Toilet floor' }, { v: 'wall', l: 'External Wall' }] },
  ]},
  paint: { label: 'Paint & Putty', fields: [
    { id: 'wallArea', label: 'Total Wall Area (sqft)', type: 'number', placeholder: 'e.g. 3600' },
    { id: 'doors', label: 'No. of Doors', type: 'number', placeholder: 'e.g. 12' },
    { id: 'windows', label: 'No. of Windows', type: 'number', placeholder: 'e.g. 18' },
  ]},
  rccSlab: { label: 'RCC Slab', fields: [
    { id: 'length', label: 'Slab Length (ft)', type: 'number', placeholder: 'e.g. 20' },
    { id: 'width', label: 'Slab Width (ft)', type: 'number', placeholder: 'e.g. 15' },
    { id: 'depth', label: 'Slab Thickness (inches)', type: 'number', placeholder: 'e.g. 5' },
  ]},
  rccColumn: { label: 'RCC Column', fields: [
    { id: 'noOfColumns', label: 'No. of Columns', type: 'number', placeholder: 'e.g. 12' },
    { id: 'height', label: 'Column Height (ft)', type: 'number', placeholder: 'e.g. 10' },
    { id: 'size', label: 'Column Size (mm)', type: 'select', options: [{ v: '230', l: '230×230mm' }, { v: '300', l: '300×300mm' }, { v: '450', l: '450×450mm' }] },
  ]},
  rccBeam: { label: 'RCC Beam', fields: [
    { id: 'noOfBeams', label: 'No. of Beams', type: 'number', placeholder: 'e.g. 10' },
    { id: 'length', label: 'Beam Length (ft)', type: 'number', placeholder: 'e.g. 15' },
    { id: 'width', label: 'Beam Width (mm)', type: 'number', placeholder: '230' },
    { id: 'depth', label: 'Beam Depth (mm)', type: 'number', placeholder: '350' },
  ]},
  staircase: { label: 'Staircase', fields: [
    { id: 'floors', label: 'No. of Floors', type: 'number', placeholder: 'e.g. 2' },
    { id: 'riser', label: 'Riser Height (mm)', type: 'number', placeholder: '175' },
    { id: 'tread', label: 'Tread Width (mm)', type: 'number', placeholder: '250' },
  ]},
  drainage: { label: 'Drainage & Plumbing', fields: [
    { id: 'pipeLength', label: 'Total Pipe Length (mtr)', type: 'number', placeholder: 'e.g. 40' },
    { id: 'dia', label: 'Pipe Diameter (mm)', type: 'select', options: [{ v: '75', l: '75mm' }, { v: '100', l: '100mm' }, { v: '150', l: '150mm' }] },
  ]},
  septic: { label: 'Septic & Water Tank', fields: [
    { id: 'persons', label: 'No. of Persons', type: 'number', placeholder: 'e.g. 5' },
    { id: 'lpcd', label: 'Water Demand (LPCD)', type: 'number', placeholder: '135' },
  ]},
  earthwork: { label: 'Earthwork', fields: [
    { id: 'length', label: 'Length (ft)', type: 'number', placeholder: 'e.g. 30' },
    { id: 'width', label: 'Width (ft)', type: 'number', placeholder: 'e.g. 40' },
    { id: 'depth', label: 'Depth (ft)', type: 'number', placeholder: 'e.g. 3' },
  ]},
  electrical: { label: 'Electrical Load', fields: [
    { id: 'lights', label: 'No. of Light Points', type: 'number', placeholder: 'e.g. 30' },
    { id: 'fans', label: 'No. of Fans', type: 'number', placeholder: 'e.g. 12' },
    { id: 'ac', label: 'No. of ACs (1.5T)', type: 'number', placeholder: 'e.g. 4' },
    { id: 'geysers', label: 'No. of Geysers', type: 'number', placeholder: 'e.g. 3' },
  ]},
  aac: { label: 'AAC / Hollow Block', fields: [
    { id: 'length', label: 'Wall Length (ft)', type: 'number', placeholder: 'e.g. 40' },
    { id: 'height', label: 'Wall Height (ft)', type: 'number', placeholder: 'e.g. 10' },
    { id: 'blockSize', label: 'Block Size', type: 'select', options: [{ v: 'aac200', l: '600×200×200mm' }, { v: 'aac100', l: '600×100×200mm' }] },
  ]},
  thumbrule: { label: 'Thumb Rules (Full Building)', fields: [
    { id: 'builtUpArea', label: 'Total Built-Up Area (sqft)', type: 'number', placeholder: 'e.g. 2400' },
  ]},
  compound: { label: 'Compound Wall', fields: [
    { id: 'length', label: 'Total Length (ft)', type: 'number', placeholder: 'e.g. 100' },
    { id: 'height', label: 'Wall Height (ft)', type: 'number', placeholder: 'e.g. 5' },
  ]},
};