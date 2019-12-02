$(document).ready(function(){
    fetch("http://localhost:3000/json/countries.json")
    .then(data => data.json())
    .then(data => {
        var options = "<option value=''>Select Nationality</option>"
        for(key in data){
            options += "<option value='" + data[key].id + "'"
            if(data[key].id == $("#nationality_val").val()) options += " selected "
            options += ">" + data[key].name + "</option>"
        }
        $("#nationality").html(options)
    })

    fetch("http://localhost:3000/json/states.json")
    .then(data => data.json())
    .then(data => {
        if($("#nationality_val").val() != '' && !isNaN($("#nationality_val").val())){
            var options = "<option value=''>Select State</option>"
            for(key in data){
                if(data[key].country_id == $("#nationality_val").val()){
                    options += "<option value='" + data[key].id + "'"
                    if(data[key].id == $("#state_of_origin_val").val()) options += " selected "
                    options += ">" + data[key].name + "</option>"
                }
            }
            $("#states").html(options)
        }else{
            var options = "<option value=''>Select State</option>"
            for(key in data){
                if(data[key].country_id == 161){
                    options += "<option value='" + data[key].id + "'>" + data[key].name + "</option>"
                }
            }
            $("#state_of_origin").html(options)
        }
    })

    fetch("http://localhost:3000/json/local.json")
    .then(data => data.json())
    .then(data => {
        if($("#state_of_origin_val").val() != '' && !isNaN($("#state_of_origin_val").val())){
            var options = "<option value=''>Select Local Government</option>", local_governments = []
            for(key in data){
                if(data[key].state.id == $("#state_of_origin_val").val()){
                    local_governments.push(data[key].state.locals)
                }
            }
            for(key in local_governments[0]){
                options += "<option value='" + local_governments[0][key].name + "'"
                if(local_governments[0][key].name == $("#local_government_val").val()) options += " selected "
                options += ">" + local_governments[0][key].name + "</option>"
            }
            console.log($("#local_government_val").val())
            $("#local_government").html(options)
        }
    })

    $("#nationality").change(function(e){
        var nationality = $(this).val()
        fetch("http://localhost:3000/json/states.json")
        .then(data => data.json())
        .then(data => {
            var options = "<option value=''>Select State Of Origin</option>"
            for(key in data){
                if(data[key].country_id == nationality){
                    options += "<option value='" + data[key].id + "'"
                    if(data[key].id == $("#state_of_origin_val").val()) options += " selected "
                    options += ">" + data[key].name + "</option>"
                }
            }
            $("#states").html(options)
        })
    })

    $(".state_of_origin").change(function(e){
        var state_of_origin = $(this).val()
        fetch("http://localhost:3000/json/local.json")
        .then(data => data.json())
        .then(data => {
            var options = "<option value=''>Select Local Government</option>", local_governments = []

            for(key in data){
                if(data[key].state.id == state_of_origin){
                    local_governments.push(data[key].state.locals)
                }
            }

            for(key in local_governments[0]){
                // console.log(local_governments[0][key])
                options += "<option value='" + local_governments[0][key].name + "'"
                if(local_governments[0][key].id == $("#local_government_val").val()) options += " selected "
                options += ">" + local_governments[0][key].name + "</option>"
            }
            // console.log(options)
            $("#local_government").html(options)
        })
    })

    $("#child_name, #city").on("keyup", () => {
        $(".to-be-inserted").remove()
        var child = {
            name: $("#child_name").val(),
            city: $("#city").val(),
            gender: $("#gender").val(),
            state: $("#states").val(),
            local_government: $("#local_government").val()
        }

        fetch("http://localhost:3000/api/check_child_details",{
            method: "post",
            body: JSON.stringify({
                name: $("#child_name").val(),
                city: $("#city").val(),
                gender: $("#gender").val(),
                state: $("#states").val(),
                local_government: $("#local_government").val()
            }),
            headers: new Headers(({
                'Content-Type': 'application/json'
            }))
        })
        .then(data => data.json())
        .then(data => {
            // console.log(data)
            if(data.reports.length > 0){
                for(key in data.reports){
                    if(key > 10) return;
                    var div = '<div class="card bg-light to-be-inserted mb-3" style="max-width: 18rem;margin: 0 auto;">' +
                                  '<div class="card-header" style="font-size: 14px;">' + data.reports[key].name + '</div>' +
                                  '<div class="card-body">' +
                                      '<p class="card-title" style="font-size: 14px;"> Reported from ' + data.reports[key].city + '</p>' +
                                  '</div>' +
                              '</div>';
                    if($(".to-be-inserted").length > 0){
                        $(div).insertAfter($(".to-be-inserted").last()).css({'transition':'.2s ease-in'})
                    }else{
                        $(div).insertAfter($("h3.related"))
                    }
                }
            }
        })
    })

    fetch("http://localhost:3000/api/reports")
    .then(res => res.json())
    .then(data => {
        // console.log(data)
        const reports = data.reports
        const totalReports = reports.length
        const reportCounts = reports.reduce((acc, report) => ((acc[report.state] = (acc[report.state] || 0) + 1), acc), {})

        const causesReportCounts = reports.reduce((acc, report) => ((acc[report.cause] = (acc[report.cause] || 0) + 1), acc), {})

        const ageRangeReportCounts = reports.reduce((acc, report) => ((acc[report.age_range] = (acc[report.age_range] || 0) + 1), acc), {})

        const genderReportCounts = reports.reduce((acc, report) => ((acc[report.gender] = (acc[report.gender] || 0) + 1), acc), {})
        // console.log(ageRangeReportCounts)
        // causesReportCounts["Natural Disasters"] === undefined ? console.log("Not defined") : console.log(causesReportCounts["Natural Disasters"])

        let northCentralDataPoints = [
            {label: 'Benue', y: reportCounts[2562], stateId: 2562},
            {label: 'Kogi', y: reportCounts[2577], stateId: 2577},
            {label: 'Kwara', y: reportCounts[2578], stateId: 2578},
            {label: 'Nassarawa', y: reportCounts[2580], stateId: 2580},
            {label: 'Niger', y: reportCounts[2581], stateId: 2581},
            {label: 'Plateau', y: reportCounts[2586], stateId: 2586},
            {label: 'FCT', y: reportCounts[2556], stateId: 2556}
        ]
        // console.log(northCentralDataPoints)

        let northEastDataPoints = [
            {label: 'Adamawa', y: reportCounts[2557], stateId: 2557},
            {label: 'Bauchi', y: reportCounts[2560], stateId: 2560},
            {label: 'Borno', y: reportCounts[2563], stateId: 2563},
            {label: 'Gombe', y: reportCounts[2570], stateId: 2570},
            {label: 'Taraba', y: reportCounts[2589], stateId: 2589},
            {label: 'Yobe', y: reportCounts[2590], stateId: 2590}
        ]

        let northWestDataPoints = [
            {label: 'Jigawa', y: reportCounts[2572], stateId: 2572},
            {label: 'Kaduna', y: reportCounts[2573], stateId: 2573},
            {label: 'Kano', y: reportCounts[2574], stateId: 2574},
            {label: 'Katsina', y: reportCounts[2575], stateId: 2575},
            {label: 'Kebbi', y: reportCounts[2576], stateId: 2576},
            {label: 'Sokoto', y: reportCounts[2588], stateId: 2588},
            {label: 'Zamfara', y: reportCounts[2591], stateId: 2591}
        ]

        let southEastDataPoints = [
            {label: 'Abia', y: reportCounts[2555], stateId: 2555},
            {label: 'Anambra', y: reportCounts[2559], stateId: 2559},
            {label: 'Ebonyi', y: reportCounts[2566], stateId: 2566},
            {label: 'Enugu', y: reportCounts[2569], stateId: 2569},
            {label: 'Imo', y: reportCounts[2571], stateId: 2571}
        ]

        let southSouthDataPoints = [
            {label: 'Akwa Ibom', y: reportCounts[2558], stateId: 2558},
            {label: 'Bayelsa', y: reportCounts[2561], stateId: 2561},
            {label: 'Cross River', y: reportCounts[2564], stateId: 2564},
            {label: 'Delta', y: reportCounts[2565], stateId: 2565},
            {label: 'Edo', y: reportCounts[2567], stateId: 2567},
            {label: 'Rivers', y: reportCounts[2587], stateId: 2587}
        ]

        let southWestDataPoints = [
            {label: 'Ekiti', y: reportCounts[2568], stateId: 2568},
            {label: 'Lagos', y: reportCounts[2579], stateId: 2579},
            {label: 'Ogun', y: reportCounts[2582], stateId: 2582},
            {label: 'Ondo', y: reportCounts[2583], stateId: 2583},
            {label: 'Osun', y: reportCounts[2584], stateId: 2584},
            {label: 'Oyo', y: reportCounts[2585], stateId: 2585}
        ]

        const northCentralChartContainer = document.querySelector("#northCentralChartContainer")
        const northEastChartContainer = document.querySelector("#northEastChartContainer")
        const northWestChartContainer = document.querySelector("#northWestChartContainer")
        const southEastChartContainer = document.querySelector("#southEastChartContainer")
        const southSouthChartContainer = document.querySelector("#southSouthChartContainer")
        const southWestChartContainer = document.querySelector("#southWestChartContainer")
        const causesChartContainer = document.querySelector("#causesChartContainer")
        const ageRangeChartContainer = document.querySelector("#ageRangeChartContainer")
        const genderChartContainer = document.querySelector("#genderChartContainer")

        if(genderChartContainer){
            var chart = new CanvasJS.Chart("genderChartContainer", {
                animationEnabled: true,
                title: {
                  text: "Chart of Gender Divide among Out Of School Children"
                },
                data: [{
                  type: "pie",
                  startAngle: 240,
                  yValueFormatString: "##0.00\"%\"",
                  indexLabel: "{label} {y}",
                  dataPoints: [
                    {y: genderReportCounts["Male"] === undefined ? 0 : (genderReportCounts["Male"]/totalReports) * 100, label: "Male"},
                    {y: genderReportCounts["Female"] === undefined ? 0 : (genderReportCounts["Female"]/totalReports) * 100, label: "Female"},
                  ]
                }]
            });
            chart.render();
        }

        if(causesChartContainer){
            var chart = new CanvasJS.Chart("causesChartContainer", {
                animationEnabled: true,
                title: {
                  text: "Chart of Causes of Out Of School Children"
                },
                data: [{
                  type: "pie",
                  startAngle: 240,
                  yValueFormatString: "##0.00\"%\"",
                  indexLabel: "{label} {y}",
                  dataPoints: [
                    {y: causesReportCounts["Natural Disasters"] === undefined ? 0 : (causesReportCounts["Natural Disasters"]/totalReports) * 100, label: "Natural Disasters"},
                    {y: causesReportCounts["Gender Discrimination"] === undefined ? 0 : (causesReportCounts["Gender Discrimination"]/totalReports) * 100, label: "Gender Discrimination"},
                    {y: causesReportCounts["Armed Conflict"] === undefined ? 0 : (causesReportCounts["Armed Conflict"]/totalReports) * 100, label: "Armed Conflict"},
                    {y: causesReportCounts["Language Challenges"] === undefined ? 0 : (causesReportCounts["Language Challenges"]/totalReports) * 100, label: "Language Challenges"},
                    {y: causesReportCounts["Household Poverty"] === undefined ? 0 : (causesReportCounts["Household Poverty"]/totalReports) * 100, label: "Household Poverty"},
                    {y: causesReportCounts["Child Labour"] === undefined ? 0 : (causesReportCounts["Child Labour"]/totalReports) * 100, label: "Child Labour"},
                    {y: causesReportCounts["Child Marriage"] === undefined ? 0 : (causesReportCounts["Child Marriage"]/totalReports) * 100, label: "Child Marriage"},
                    {y: causesReportCounts["Illnesses"] === undefined ? 0 : (causesReportCounts["Illnesses"]/totalReports) * 100, label: "Illnesses"},
                    {y: causesReportCounts["Disabilites"] === undefined ? 0 : (causesReportCounts["Disabilites"]/totalReports) * 100, label: "Disabilites"},
                    {y: causesReportCounts["Low number of schools"] === undefined ? 0 : (causesReportCounts["Low number of schools"]/totalReports) * 100, label: "Low number of schools"},
                    {y: causesReportCounts["Lack of qualified teachers"] === undefined ? 0 : (causesReportCounts["Lack of qualified teachers"]/totalReports) * 100, label: "Lack of qualified teachers"},
                    {y: causesReportCounts["Lack of school materials"] === undefined ? 0 : (causesReportCounts["Lack of school materials"]/totalReports) * 100, label: "Lack of school materials"},
                    {y: causesReportCounts["Religious beliefs"] === undefined ? 0 : (causesReportCounts["Religious beliefs"]/totalReports) * 100, label: "Religious beliefs"},
                    {y: causesReportCounts["Absence from school"] === undefined ? 0 : (causesReportCounts["Absence from school"]/totalReports) * 100, label: "Absence from school"},
                    {y: causesReportCounts["Distance from school"] === undefined ? 0 : (causesReportCounts["Distance from school"]/totalReports) * 100, label: "Distance from school"},
                    {y: causesReportCounts["Unknown"] === undefined ? 0 : (causesReportCounts["Unknown"]/totalReports) * 100, label: "Unknown"},
                  ]
                }]
            });
            chart.render();
        }

        if(ageRangeChartContainer){
            var chart = new CanvasJS.Chart("ageRangeChartContainer", {
                animationEnabled: true,
                title: {
                  text: "Chart of Age Range of Out Of School Children"
                },
                data: [{
                  type: "pie",
                  startAngle: 240,
                  yValueFormatString: "##0.00\"%\"",
                  indexLabel: "{label} {y}",
                  dataPoints: [
                    {y: ageRangeReportCounts["0 to 5"] === undefined ? 0 : (ageRangeReportCounts["0 to 5"]/totalReports) * 100, label: "0 to 5 years"},
                    {y: ageRangeReportCounts["6 to 10"] === undefined ? 0 : (ageRangeReportCounts["6 to 10"]/totalReports) * 100, label: "6 to 10 years"},
                    {y: ageRangeReportCounts["11 to 15"] === undefined ? 0 : (ageRangeReportCounts["11 to 15"]/totalReports) * 100, label: "11 to 15 years"},
                    {y: ageRangeReportCounts["16 and higher"] === undefined ? 0 : (ageRangeReportCounts["16 and higher"]/totalReports) * 100, label: "16 and higher years"}
                  ]
                }]
            });
            chart.render();
        }

        if(northCentralChartContainer){
            // renderChart('northCentralChartContainer', northCentralDataPoints, 'North Central')
            const chart = new CanvasJS.Chart('northCentralChartContainer', {
                animationEnabled: true,
                theme: 'theme1',
                title: {
                    text: 'Out Of School Children Live Reports From North Central'
                },
                data: [
                    {
                        type: 'column',
                        dataPoints: northCentralDataPoints
                    }
                ]
            })
            chart.render()
            renderOnBindEvent(northCentralDataPoints, chart)
        }

        if(northEastChartContainer){
            const chart = new CanvasJS.Chart('northEastChartContainer', {
                animationEnabled: true,
                theme: 'theme1',
                title: {
                    text: 'Out Of School Children Live Reports From North East'
                },
                data: [
                    {
                        type: 'column',
                        dataPoints: northEastDataPoints
                    }
                ]
            })
            chart.render()
            renderOnBindEvent(northEastDataPoints, chart)
        }

        if(northWestChartContainer){
            const chart = new CanvasJS.Chart('northWestChartContainer', {
                animationEnabled: true,
                theme: 'theme1',
                title: {
                    text: 'Out Of School Children Live Reports From North West'
                },
                data: [
                    {
                        type: 'column',
                        dataPoints: northWestDataPoints
                    }
                ]
            })
            chart.render()
            renderOnBindEvent(northWestDataPoints, chart)
        }

        function renderChart(containerString, dataPoints, geoZone){
            const chart = new CanvasJS.Chart(containerString, {
                animationEnabled: true,
                theme: 'theme1',
                title: {
                    text: 'Out Of School Children Live Reports From ' + geoZone
                },
                data: [
                    {
                        type: 'column',
                        dataPoints: dataPoints
                    }
                ]
            })
            chart.render()
            renderOnBindEvent(northWestDataPoints, chart)
        }

        function renderOnBindEvent(dataPoints, chart){
            // Enable pusher logging - don't include this in production
            Pusher.logToConsole = true;

            var pusher = new Pusher('6d73f17bc76526db774b', {
              cluster: 'eu',
              forceTLS: true
            });

            var channel = pusher.subscribe('child-report');
            channel.bind('each-report', function(data) {
                console.log(data)
                dataPoints = dataPoints.map(x => {
                    console.log(x.stateId)
                    if(x.stateId == data.data.state){
                        if(isNaN(x.y)){
                            x.y = 1
                        }else{
                            x.y += 1
                        }
                        // console.log(x.y)
                    }
                    console.log(x)
                    return x
                })
                chart.render()
            });
        }

        if(southEastChartContainer){
            const chart = new CanvasJS.Chart('southEastChartContainer', {
                animationEnabled: true,
                theme: 'theme1',
                title: {
                    text: 'Out Of School Children Live Reports From South East'
                },
                data: [
                    {
                        type: 'column',
                        dataPoints: southEastDataPoints
                    }
                ]
            })
            chart.render()
            renderOnBindEvent(southEastDataPoints, chart)
        }

        if(southSouthChartContainer){
            const chart = new CanvasJS.Chart('southSouthChartContainer', {
                animationEnabled: true,
                theme: 'theme1',
                title: {
                    text: 'Out Of School Children Live Reports From South South'
                },
                data: [
                    {
                        type: 'column',
                        dataPoints: southSouthDataPoints
                    }
                ]
            })
            chart.render()
            renderOnBindEvent(southSouthDataPoints, chart)
        }

        if(southWestChartContainer){
            const chart = new CanvasJS.Chart('southWestChartContainer', {
                animationEnabled: true,
                theme: 'theme1',
                title: {
                    text: 'Out Of School Children Live Reports In South West'
                },
                data: [
                    {
                        type: 'column',
                        dataPoints: southWestDataPoints
                    }
                ]
            })
            chart.render()
            renderOnBindEvent(southWestDataPoints, chart)
        }

    })
    .catch(err => console.log(err))

})
