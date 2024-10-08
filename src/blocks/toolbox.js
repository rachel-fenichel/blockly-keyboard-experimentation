/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const toolbox = {
  'kind': 'flyoutToolbox',
  'contents': [
    {
      kind: 'block',
      type: 'p5_background_color',
      inputs: {
        COLOR: {
          shadow: {
            type: 'colour_picker',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'p5_stroke',
      inputs: {
        COLOR: {
          shadow: {
            type: 'colour_picker',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'p5_fill',
      inputs: {
        COLOR: {
          shadow: {
            type: 'colour_picker',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'colour_random',
    },
    {
      kind: 'block',
      type: 'draw_emoji',
    },
    {
      kind: 'block',
      type: 'simple_circle',
      inputs: {
        COLOR: {
          shadow: {
            type: 'colour_picker',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'p5_ellipse',
      inline: 'true',
      inputs: {
        X: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 100,
            },
          },
        },
        Y: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 100,
            },
          },
        },
        WIDTH: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 50,
            },
          },
        },
        HEIGHT: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 50,
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'math_random_int',
      inputs: {
        FROM: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 0,
            },
          },
        },
        TO: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 400,
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'controls_repeat_ext',
      inputs: {
        TIMES: {
          block: {
            type: 'math_number',
            fields: {
              NUM: 5,
            },
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'math_arithmetic',
      fields: {
        OP: 'ADD',
      },
      inputs: {
        A: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
        B: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 1,
            },
          },
        },
      },
    },
  ],
};
