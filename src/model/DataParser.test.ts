import { loadData } from "./DataParser";

describe('loads GeoJSON file as object with properties', () => {
  it('loads the mock data', async () => {
    let data = await loadData(true).then(data => data);
    expect(data).toBeDefined();
    expect(data).not.toBe(null);
    expect(data).not.toBe({});
    expect(data.features).toBeDefined();
    expect(data.features.length).toBe(15);
  });
  
  it('loads the full data', async () => {
    let data = await loadData().then(data => data);
    expect(data).toBeDefined();
    expect(data).not.toBe(null);
    expect(data).not.toBe({});
    expect(data.features).toBeDefined();
    expect(data.features.length).toBe(255);
  });
});