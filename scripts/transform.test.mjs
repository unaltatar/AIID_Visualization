import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseIncidentRows, buildMeta } from './transform.mjs'

test('parseIncidentRows reads data starting at row 4, using row 3 as the header', () => {
  const rows = [
    ['AI Incident Database - Incidents | 2 incidents | 4 columns'],
    ['INCIDENT IDENTITY', null, null, 'MIT'],
    ['Incident ID', 'date', 'title', 'Risk Domain'],
    [1, '2020-01-01', 'First incident', 'Misinformation'],
    [2, '2021-06-15', 'Second incident', null],
  ]

  const incidents = parseIncidentRows(rows)

  assert.equal(incidents.length, 2)
  assert.deepEqual(incidents[0], {
    id: 1,
    date: '2020-01-01',
    title: 'First incident',
    riskDomain: 'Misinformation',
  })
  assert.equal(incidents[1].riskDomain, null)
})

test('parseIncidentRows treats a blank cell as null, not an empty string', () => {
  // sheet_to_json with raw:false renders a blank cell as "", not a missing array slot,
  // so defval never kicks in. Without this normalization every sparse CSETv1 field
  // would look 100% covered.
  const rows = [['title'], ['group'], ['Incident ID', 'Autonomy Level'], [1, '']]
  const incidents = parseIncidentRows(rows)
  assert.equal(incidents[0].autonomyLevel, null)
})

test('parseIncidentRows skips rows with no Incident ID', () => {
  const rows = [
    ['title row'],
    ['group row'],
    ['Incident ID', 'title'],
    [1, 'Kept'],
    [null, 'Dropped, no id'],
  ]

  const incidents = parseIncidentRows(rows)

  assert.equal(incidents.length, 1)
  assert.equal(incidents[0].title, 'Kept')
})

test('parseIncidentRows throws when the sheet layout does not match what the pipeline expects', () => {
  const rows = [['unexpected'], ['layout'], ['change']]
  assert.throws(() => parseIncidentRows(rows), /Incident ID/)
})

test('buildMeta reports per-field coverage as a percentage', () => {
  const incidents = [{ riskDomain: 'Misinformation' }, { riskDomain: null }]
  const meta = buildMeta(incidents, 'test.xlsx')

  assert.equal(meta.totalIncidents, 2)
  assert.equal(meta.coverage.riskDomain, 50)
  assert.equal(meta.sourceFileName, 'test.xlsx')
})
