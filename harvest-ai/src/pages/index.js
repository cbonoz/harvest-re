'use client'

import Head from 'next/head'
import { useState } from 'react'

import Layout from '@components/Layout'
import Section from '@components/Section'
import Container from '@components/Container'
import Map from '@components/Map'
import Button from '@components/Button'

import styles from '@styles/Home.module.scss'
import { searchProperties } from 'src/util/api'

const DEFAULT_CENTER = [38.907132, -77.036546]

export default function Home() {
  const [properties, setProperties] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  async function search() {
    if (!query) return

    setLoading(true)

    try {
      const result = await searchProperties({ query, access_code: 'BANANA1' })
      setProperties(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Head>
        <title>HarvestAI</title>
        <meta name="description" content="Create mapping apps with HarvestAI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container>
          {/* Tailwind grid with sidebar */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              {/* Sidebar */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Search anywhere</h2>
                <p className="text-gray-600">This is a sidebar</p>

                {/* Input query */}
                <div className="flex-wrap -mx-2 overflow-hidden my-4">
                  <h3>Search:</h3>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />

                  <Button
                    className="mt-2"
                    onClick={search}
                    loading={loading}
                    disabled={loading}
                  >
                    Search
                  </Button>
                </div>

                <hr />
                <div className="flex-wrap -mx-2 overflow-hidden my-4">
                  <h3>Examples:</h3>
                  <pre>
                    Plymouth, MA
                    <br />
                    Middlesex County, MA
                  </pre>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-9">
              <Map
                className={styles.homeMap}
                width="800"
                height="400"
                center={DEFAULT_CENTER}
                zoom={12}
              >
                {({ TileLayer, Marker, Popup }) => (
                  <>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={DEFAULT_CENTER}>
                      <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                      </Popup>
                    </Marker>
                  </>
                )}
              </Map>
            </div>
          </div>
          {/* Tailwind grid with sidebar */}
        </Container>
      </Section>
    </Layout>
  )
}
