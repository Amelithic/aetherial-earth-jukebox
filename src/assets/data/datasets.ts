import exampleImage from './example-data.jpg'

export interface Dataset {
  id: string
  name: string
  description: string
  longDescription: string
  source: string
  date: string
  credit: string
  image: string
}

export const datasets: Dataset[] = [
  {
    id: 'earth-winds',
    name: 'Earth Winds',
    description:
      'A sample NASA-style Earth visualisation used to test the image-to-audio pipeline.',
    longDescription:
      'This sample dataset stands in for the real NASA imagery we will load into the jukebox. ' +
      'Each vertical slice of the image is averaged down to a single colour, and that colour is ' +
      'mapped to a pitch and played back as a short note. Replace this entry with real mission ' +
      'data and metadata once the assets are ready.',
    source: 'NASA Space Apps Earth Jukebox sample data',
    date: '2026',
    credit: 'Sample data',
    image: exampleImage,
  },
  {
    id: 'ocean-currents',
    name: 'Ocean Currents',
    description: 'A second placeholder record so the Browse gallery has more than one card.',
    longDescription:
      'Placeholder metadata for a future ocean-current visualisation. The image currently reuses ' +
      'the shared sample so the gallery, routing, and sonification flow can be tested end to end.',
    source: 'NASA Space Apps Earth Jukebox sample data',
    date: '2026',
    credit: 'Sample data',
    image: exampleImage,
  },
  {
    id: 'polar-vortex',
    name: 'Polar Vortex',
    description: 'A third placeholder record for testing navigation between jukebox datasets.',
    longDescription:
      'Placeholder metadata for a future atmospheric dataset. Swap the image import and metadata ' +
      'when the real asset is available.',
    source: 'NASA Space Apps Earth Jukebox sample data',
    date: '2026',
    credit: 'Sample data',
    image: exampleImage,
  },
]

export function getDatasetById(id?: string | null): Dataset {
  return datasets.find((dataset) => dataset.id === id) ?? datasets[0]
}

export function getNextDataset(id: string): Dataset {
  const index = datasets.findIndex((dataset) => dataset.id === id)
  if (index === -1) return datasets[0]
  return datasets[(index + 1) % datasets.length]
}
