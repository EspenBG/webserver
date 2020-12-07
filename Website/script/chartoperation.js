var ctx = document.getElementById('myChart').getContext('2d'); //Defines the basic graphic element of the graph
let testData = [{y: 27.58, t: 1607360198700},
{y: 20.9, t: 1607361204714},
{y: 21.4, t: 1607360207703},
{y: 28.05, t: 1607360210734},
{y: 20.72, t: 1607360219761},
{y: 23.26, t: 1607360258810},
{y: 27.29, t: 1607360264854},
{y: 22.89, t: 1607360270872}];

let timeFormat = 'x';

var myLineChart = new Chart(ctx, { //Defines the graph
    type: 'line', //Defines the type of graph
    data: { //Decides how the data (content of the graph will be)
        // labels: ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '08:00', '09:00'], //Labels define the values of the x-axis (and can be altered at a later point/live)
        datasets: [ //Datasets refers to the different graphs and the data they contain
            {
                label: 'Data 1', //Label of dataset/graph 1
                yAxisID: 'A',
                data: [], //The dataArray that actually stores the data
                backgroundColor: [ //The background color of the graph (usually not in use)
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [ //The border color of the graph (the color of the actual line)
                    'rgba(255, 99, 12, 1)'
                ],
                borderWidth: 1, //The width of the graph line
                fill: false,
                lineTension: 0.1,
            },
            {
                label: 'Data 2',
                yAxisID: 'B',
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgb(29,28,255)'
                ],
                borderWidth: 1,
                fill: true,
                lineTension: 0,
                steppedLine: 'before',
            }
        ]
    },
    options: {
        // responsive: true,
        title:      {
            display: true,
            text:    "Chart.js Time Scale"
        },

        scales:     {
            xAxes: [{
                type: "time",
                time: {
                    format: timeFormat,
                    tooltipFormat: 'll'
                },
                scaleLabel: {
                    display:     true,
                    labelString: 'time'
                },
                distribution: 'linear'
            }],
            yAxes: [{
                id:'A',
                scaleLabel: {

                    display:     true,
                    labelString: 'value'
                }
            },
                {
                    id:'B',
                    scaleLabel: {
                        display:     true,
                        labelString: 'pådrag'
                    },
                    position: 'right',
                    ticks: {
                        max: 1,
                        min: 0
                    }
                }]
        },

        // scales: {
        //     yAxes: [{
        //         ticks: {
        //             beginAtZero: true //Keep this true to begin at zero in the graph
        //         }
        //     }]
        // },
        // responsive: true,
        // maintainAspectRatio: false,
    }
});