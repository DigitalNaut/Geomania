import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from 'tailwind.config';

// @ts-expect-error missing types
const fullConfig = resolveConfig(tailwindConfig);

export default fullConfig;
