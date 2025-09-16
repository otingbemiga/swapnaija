// src/types/naija-state-local-government.d.ts
declare module 'naija-state-local-government' {
  interface StatesLgas {
    states: () => string[];
    lgas: (state: string) => { lgas: string[] };
  }

  const statesLgas: StatesLgas;
  export default statesLgas;
}
