import surfaceCurrents from './ecco2-and-grid.jpg'
import surfaceCurrents2 from './atlantic-5x3-montage.png'
import nightLights from './nightlights_flat_change_still_8k.00700.jpg'
import rainSnow from './rain+snow.png'
import seaTemp from './sea-surface-temp.png'
import surfaceTemp from './MC01_stage3_GMAO_near_surface_temperature_2048x1024_en.00001_searchweb.png'
import surfaceWind from './MC02_stage3_GMAO_near_surface_wind_2048x1024_en.00001_searchweb.png'

export interface Dataset {
  id: string
  name: string
  description: string
  source: string
  date: string
  credit: string
  image: string
}

export const datasets: Dataset[] = [
  {
    id: 'surface-currents',
    name: 'Global Sea Surface Currents and Temperature',
    description: 'This visualisation shows sea surface current flows, coloured by corresponding sea surface temperature data.',
    source: 'https://svs.gsfc.nasa.gov/3912',
    date: '2012',
    credit: 'Greg Shirah @ NASA Scientific Visualisation Studio',
    image: surfaceCurrents,
  },
  {
    id: 'surface-currents-rgb',
    name: 'Global Sea Surface Currents and Temperature (RGB)',
    description: 'This visualisation is a zoomed in version of the Global Sea Surface Currents data, showing sea surface current flows, coloured by corresponding sea surface temperature data.',
    source: 'https://svs.gsfc.nasa.gov/3912',
    date: '2012',
    credit: 'Greg Shirah @ NASA Scientific Visualisation Studio',
    image: surfaceCurrents2,
  },
  {
    id: 'night-lights',
    name: 'Change in Night Lights between 2012 and 2023',
    description: 'This visualisation shows the change in average nighttime light from 2012 to 2023.',
    source: 'https://svs.gsfc.nasa.gov/5276/',
    date: '2024',
    credit: 'Greg Shirah @ NASA Scientific Visualisation Studio',
    image: nightLights,
  },
  {
    id: 'rain-snow',
    name: 'Rain and Snow - Worldview Sat Observations',
    description: 'This visualisation is using NASA Worldview, demonstrating the cloud movement to represent the rain and snowfall across the globe.',
    source: 'https://worldview.earthdata.nasa.gov/?v=-205.72171420740915,-98.53068072538338,206.78657152152607,106.52986177528524&df=true&kiosk=true&eic=si&l=IMERG_Precipitation_Rate,Land_Mask&lg=false&t=2023-06-11-T16%3A00%3A00Z',
    date: '2026',
    credit: 'NASA Scientific Visualisation Studio - Worldview Sat Observations',
    image: rainSnow,
  },
  {
    id: 'sea-surface-temp',
    name: 'Sea Surface Temperature - Worldview Sat Observations',
    description: 'This visualisation is using NASA Worldview, demonstrating the sea surface temperature across the globe.',
    source: 'https://worldview.earthdata.nasa.gov/?v=-207.7830430896525,-98.53068072538338,208.84790040376942,106.52986177528524&df=true&kiosk=true&eic=si&l=Coastlines_15m(opacity=0.71),GHRSST_L4_MUR_Sea_Surface_Temperature(palette=divergent_1)&lg=true&t=2026-11-14-T12%3A00%3A00Z',
    date: '2026',
    credit: 'NASA Scientific Visualisation Studio - Worldview Sat Observations',
    image: seaTemp,
  },
  {
    id: 'geos-fp',
    name: 'GEOS-FP Near-Surface Temperature',
    description: 'This visualisation shows the near-surface temperature sampling model fields at about 6 feet above the surface of the Earth. Colours represent temperature, ranging from white at extreme cold to dark red at extreme heat.',
    source: 'https://svs.gsfc.nasa.gov/5147/',
    date: '2023',
    credit: 'Joseph V. Ardizzone @ NASA Scientific Visualisation Studio',
    image: surfaceTemp,
  },
  {
    id: 'geos-fp-wind',
    name: 'GEOS-FP Near-Surface Wind Speed',
    description: 'This visualisation shows the near-surface wind speeds, where dark red represents the strongest force winds.',
    source: 'https://svs.gsfc.nasa.gov/5148/',
    date: '2023',
    credit: 'Joseph V. Ardizzone @ NASA Scientific Visualisation Studio',
    image: surfaceWind,
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

export function getPreviousDataset(id: string): Dataset {
  const index = datasets.findIndex((dataset) => dataset.id === id)
  if (index === -1) return datasets[datasets.length - 1]
  return datasets[(index - 1 + datasets.length) % datasets.length]
}
