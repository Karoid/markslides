import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { VegaIcon } from '@/components/icons';
import type { ToolbarCommand, ToolbarContext } from '@/toolbar/types/toolbar';

// Vega 예시들
const vegaExamples: { name: string; description: string; thumbnail: string; spec: any }[] = [
    {
        name: 'Bar Chart',
        description: 'Basic bar chart visualization',
        thumbnail: 'https://vega.github.io/vega/examples/img/bar-chart.png',
        spec: {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 400,
            "height": 200,
            "padding": 5,
            "data": [
                {
                    "name": "table",
                    "values": [
                        {"category": "A", "amount": 28},
                        {"category": "B", "amount": 55},
                        {"category": "C", "amount": 43},
                        {"category": "D", "amount": 91},
                        {"category": "E", "amount": 81}
                    ]
                }
            ],
            "scales": [
                {
                    "name": "xscale",
                    "type": "band",
                    "domain": {"data": "table", "field": "category"},
                    "range": "width",
                    "padding": 0.05,
                    "round": true
                },
                {
                    "name": "yscale",
                    "domain": {"data": "table", "field": "amount"},
                    "nice": true,
                    "range": "height"
                }
            ],
            "axes": [
                {"orient": "bottom", "scale": "xscale"},
                {"orient": "left", "scale": "yscale"}
            ],
            "marks": [
                {
                    "type": "rect",
                    "from": {"data": "table"},
                    "encode": {
                        "enter": {
                            "x": {"scale": "xscale", "field": "category"},
                            "width": {"scale": "xscale", "band": 1},
                            "y": {"scale": "yscale", "field": "amount"},
                            "y2": {"scale": "yscale", "value": 0}
                        },
                        "update": {
                            "fill": {"value": "steelblue"}
                        }
                    }
                }
            ]
        }
    },
    {
        name: 'Line Chart',
        description: 'Time series line chart',
        thumbnail: 'https://vega.github.io/vega/examples/img/line-chart.png',
        spec: {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 400,
            "height": 200,
            "padding": 5,
            "data": [
                {
                    "name": "table",
                    "values": [
                        {"x": 0, "y": 28}, {"x": 1, "y": 55}, {"x": 2, "y": 43},
                        {"x": 3, "y": 91}, {"x": 4, "y": 81}, {"x": 5, "y": 53},
                        {"x": 6, "y": 19}, {"x": 7, "y": 87}, {"x": 8, "y": 52}
                    ]
                }
            ],
            "scales": [
                {
                    "name": "xscale",
                    "type": "linear",
                    "range": "width",
                    "domain": {"data": "table", "field": "x"}
                },
                {
                    "name": "yscale",
                    "type": "linear",
                    "range": "height",
                    "domain": {"data": "table", "field": "y"},
                    "nice": true
                }
            ],
            "axes": [
                {"orient": "bottom", "scale": "xscale"},
                {"orient": "left", "scale": "yscale"}
            ],
            "marks": [
                {
                    "type": "line",
                    "from": {"data": "table"},
                    "encode": {
                        "enter": {
                            "x": {"scale": "xscale", "field": "x"},
                            "y": {"scale": "yscale", "field": "y"},
                            "stroke": {"value": "steelblue"},
                            "strokeWidth": {"value": 2}
                        }
                    }
                }
            ]
        }
    },
    {
        name: 'Pie Chart',
        description: 'Circular pie chart',
        thumbnail: 'https://vega.github.io/vega/examples/img/pie-chart.png',
        spec: {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 200,
            "height": 200,
            "padding": 5,
            "data": [
                {
                    "name": "table",
                    "values": [
                        {"id": 1, "field": 4},
                        {"id": 2, "field": 6},
                        {"id": 3, "field": 10},
                        {"id": 4, "field": 3},
                        {"id": 5, "field": 7}
                    ]
                }
            ],
            "scales": [
                {
                    "name": "color",
                    "type": "ordinal",
                    "domain": {"data": "table", "field": "id"},
                    "range": {"scheme": "category20"}
                }
            ],
            "marks": [
                {
                    "type": "arc",
                    "from": {"data": "table"},
                    "encode": {
                        "enter": {
                            "fill": {"scale": "color", "field": "id"},
                            "x": {"signal": "width / 2"},
                            "y": {"signal": "height / 2"}
                        },
                        "update": {
                            "startAngle": {"field": "startAngle"},
                            "endAngle": {"field": "endAngle"},
                            "padAngle": {"value": 0.007},
                            "innerRadius": {"value": 0},
                            "outerRadius": {"signal": "min(width, height) / 2"}
                        }
                    }
                }
            ]
        }
    },
    {
        name: 'Scatter Plot',
        description: 'Scatter plot with points',
        thumbnail: 'https://vega.github.io/vega/examples/img/scatter-plot.png',
        spec: {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 400,
            "height": 200,
            "padding": 5,
            "data": [
                {
                    "name": "table",
                    "values": [
                        {"x": 0, "y": 28}, {"x": 1, "y": 55}, {"x": 2, "y": 43},
                        {"x": 3, "y": 91}, {"x": 4, "y": 81}, {"x": 5, "y": 53},
                        {"x": 6, "y": 19}, {"x": 7, "y": 87}, {"x": 8, "y": 52}
                    ]
                }
            ],
            "scales": [
                {
                    "name": "xscale",
                    "type": "linear",
                    "range": "width",
                    "domain": {"data": "table", "field": "x"}
                },
                {
                    "name": "yscale",
                    "type": "linear",
                    "range": "height",
                    "domain": {"data": "table", "field": "y"},
                    "nice": true
                }
            ],
            "axes": [
                {"orient": "bottom", "scale": "xscale"},
                {"orient": "left", "scale": "yscale"}
            ],
            "marks": [
                {
                    "type": "symbol",
                    "from": {"data": "table"},
                    "encode": {
                        "enter": {
                            "x": {"scale": "xscale", "field": "x"},
                            "y": {"scale": "yscale", "field": "y"},
                            "fill": {"value": "steelblue"},
                            "size": {"value": 100}
                        }
                    }
                }
            ]
        }
    },
    {
        name: 'Area Chart',
        description: 'Filled area chart',
        thumbnail: 'https://vega.github.io/vega/examples/img/area-chart.png',
        spec: {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 400,
            "height": 200,
            "padding": 5,
            "data": [
                {
                    "name": "table",
                    "values": [
                        {"x": 0, "y": 28}, {"x": 1, "y": 55}, {"x": 2, "y": 43},
                        {"x": 3, "y": 91}, {"x": 4, "y": 81}, {"x": 5, "y": 53},
                        {"x": 6, "y": 19}, {"x": 7, "y": 87}, {"x": 8, "y": 52}
                    ]
                }
            ],
            "scales": [
                {
                    "name": "xscale",
                    "type": "linear",
                    "range": "width",
                    "domain": {"data": "table", "field": "x"}
                },
                {
                    "name": "yscale",
                    "type": "linear",
                    "range": "height",
                    "domain": {"data": "table", "field": "y"},
                    "nice": true
                }
            ],
            "axes": [
                {"orient": "bottom", "scale": "xscale"},
                {"orient": "left", "scale": "yscale"}
            ],
            "marks": [
                {
                    "type": "area",
                    "from": {"data": "table"},
                    "encode": {
                        "enter": {
                            "x": {"scale": "xscale", "field": "x"},
                            "y": {"scale": "yscale", "field": "y"},
                            "y2": {"scale": "yscale", "value": 0},
                            "fill": {"value": "steelblue"},
                            "fillOpacity": {"value": 0.6}
                        }
                    }
                }
            ]
        }
    },
    {
        name: 'Heatmap',
        description: 'Color-coded heatmap',
        thumbnail: 'https://vega.github.io/vega/examples/img/heatmap.png',
        spec: {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 300,
            "height": 200,
            "padding": 5,
            "data": [
                {
                    "name": "table",
                    "values": [
                        {"x": 0, "y": 0, "value": 0.5}, {"x": 1, "y": 0, "value": 0.8},
                        {"x": 2, "y": 0, "value": 0.2}, {"x": 0, "y": 1, "value": 0.9},
                        {"x": 1, "y": 1, "value": 0.3}, {"x": 2, "y": 1, "value": 0.7},
                        {"x": 0, "y": 2, "value": 0.1}, {"x": 1, "y": 2, "value": 0.6},
                        {"x": 2, "y": 2, "value": 0.4}
                    ]
                }
            ],
            "scales": [
                {
                    "name": "xscale",
                    "type": "band",
                    "domain": {"data": "table", "field": "x"},
                    "range": "width"
                },
                {
                    "name": "yscale",
                    "type": "band",
                    "domain": {"data": "table", "field": "y"},
                    "range": "height"
                },
                {
                    "name": "color",
                    "type": "linear",
                    "range": {"scheme": "blues"},
                    "domain": {"data": "table", "field": "value"}
                }
            ],
            "marks": [
                {
                    "type": "rect",
                    "from": {"data": "table"},
                    "encode": {
                        "enter": {
                            "x": {"scale": "xscale", "field": "x"},
                            "y": {"scale": "yscale", "field": "y"},
                            "width": {"scale": "xscale", "band": 1},
                            "height": {"scale": "yscale", "band": 1},
                            "fill": {"scale": "color", "field": "value"}
                        }
                    }
                }
            ]
        }
    },
    {
        name: 'Histogram',
        description: 'Distribution histogram',
        thumbnail: 'https://vega.github.io/vega/examples/img/histogram.png',
        spec: {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 400,
            "height": 200,
            "padding": 5,
            "data": [
                {
                    "name": "table",
                    "values": [
                        1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5,
                        6, 6, 6, 6, 7, 7, 7, 8, 8, 9
                    ]
                }
            ],
            "scales": [
                {
                    "name": "xscale",
                    "type": "band",
                    "range": "width",
                    "domain": {"data": "table", "field": "data"}
                },
                {
                    "name": "yscale",
                    "type": "linear",
                    "range": "height",
                    "domain": {"data": "table", "field": "data"},
                    "nice": true
                }
            ],
            "axes": [
                {"orient": "bottom", "scale": "xscale"},
                {"orient": "left", "scale": "yscale"}
            ],
            "marks": [
                {
                    "type": "rect",
                    "from": {"data": "table"},
                    "encode": {
                        "enter": {
                            "x": {"scale": "xscale", "field": "data"},
                            "width": {"scale": "xscale", "band": 1},
                            "y": {"scale": "yscale", "field": "data"},
                            "y2": {"scale": "yscale", "value": 0},
                            "fill": {"value": "steelblue"}
                        }
                    }
                }
            ]
        }
    },
    {
        name: 'Box Plot',
        description: 'Statistical box plot',
        thumbnail: 'https://vega.github.io/vega/examples/img/box-plot.png',
        spec: {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 400,
            "height": 200,
            "padding": 5,
            "data": [
                {
                    "name": "table",
                    "values": [
                        {"category": "A", "min": 1, "q1": 3, "median": 5, "q3": 7, "max": 9},
                        {"category": "B", "min": 2, "q1": 4, "median": 6, "q3": 8, "max": 10},
                        {"category": "C", "min": 0, "q1": 2, "median": 4, "q3": 6, "max": 8}
                    ]
                }
            ],
            "scales": [
                {
                    "name": "xscale",
                    "type": "band",
                    "range": "width",
                    "domain": {"data": "table", "field": "category"}
                },
                {
                    "name": "yscale",
                    "type": "linear",
                    "range": "height",
                    "domain": {"data": "table", "fields": ["min", "max"]},
                    "nice": true
                }
            ],
            "axes": [
                {"orient": "bottom", "scale": "xscale"},
                {"orient": "left", "scale": "yscale"}
            ],
            "marks": [
                {
                    "type": "rect",
                    "from": {"data": "table"},
                    "encode": {
                        "enter": {
                            "x": {"scale": "xscale", "field": "category"},
                            "width": {"scale": "xscale", "band": 0.5},
                            "y": {"scale": "yscale", "field": "q1"},
                            "y2": {"scale": "yscale", "field": "q3"},
                            "fill": {"value": "lightblue"}
                        }
                    }
                }
            ]
        }
    },
    {
        name: 'Tree Map',
        description: 'Hierarchical tree map',
        thumbnail: 'https://vega.github.io/vega/examples/img/treemap.png',
        spec: {
            "$schema": "https://vega.github.io/schema/vega/v5.json",
            "width": 400,
            "height": 200,
            "padding": 5,
            "data": [
                {
                    "name": "table",
                    "values": [
                        {"name": "A", "value": 100},
                        {"name": "B", "value": 80},
                        {"name": "C", "value": 60},
                        {"name": "D", "value": 40},
                        {"name": "E", "value": 20}
                    ]
                }
            ],
            "scales": [
                {
                    "name": "color",
                    "type": "linear",
                    "range": {"scheme": "blues"},
                    "domain": {"data": "table", "field": "value"}
                }
            ],
            "marks": [
                {
                    "type": "rect",
                    "from": {"data": "table"},
                    "encode": {
                        "enter": {
                            "x": {"value": 0},
                            "y": {"value": 0},
                            "width": {"value": 100},
                            "height": {"value": 50},
                            "fill": {"scale": "color", "field": "value"}
                        }
                    }
                }
            ]
        }
    }
];

const vega: ToolbarCommand = {
    name: 'vega',
    icon: <VegaIcon size={16} />,
    tooltip: 'Add Vega Chart',
    execute: (codeMirrorRef: ReactCodeMirrorRef, context?: ToolbarContext) => {
        const { state, view } = codeMirrorRef;

        if (!state || !view) {
            return;
        }

        // Vega 다이얼로그 열기
        if (context?.openDialog) {
            context.openDialog('vega');
        } else {
            // 기본 예시 삽입 (다이얼로그가 없는 경우)
            const selectedText = view.state.sliceDoc(
                view.state.selection.main.from,
                view.state.selection.main.to
            );

            const mark = '```vega';
            const sampleChart = vegaExamples[0]?.spec
                ? JSON.stringify(vegaExamples[0].spec, null, 2)
                : '';

            view.dispatch({
                changes: {
                    from: view.state.selection.main.from,
                    to: view.state.selection.main.to,
                    insert: `
${mark}
${selectedText.length > 0 ? selectedText : sampleChart}
\`\`\`
            `.trim(),
                },
            });
        }
    },
};

export default vega;
export { vegaExamples };