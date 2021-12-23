import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from 'tailwind.config';

// @ts-expect-error
const fullConfig = resolveConfig(tailwindConfig);

export default fullConfig;
