define(function (require) {
  "use strict";
  var $ = require('jquery'),
    _ = require('underscore'),
    Gonrin = require('gonrin');
  var template = require('text!./IndexViewTpl.html');

  return Gonrin.View.extend({
    render: function () {
      var self = this;
      this.$el.html(template)
      this.from_date = moment('2009-01-01').format('X');
      this.to_date = moment('2009-02-02').format('X');
      this.interval = 'day'
      this.$el.find('#from-date-dashboard').val('2009-01-01')
      this.$el.find('#to-date-dashboard').val('2009-02-02')
      self.render_chart()
      this.$el.find('#from-date-dashboard').change(function(){
        let date = $(this).val();
        self.from_date = moment(date).format('X')
        self.render_chart()
        // console.log(moment(date).format('X'))
      })
      this.$el.find('#to-date-dashboard').change(function(){
        let date = $(this).val();
        self.from_date = moment(date).format('X')
        self.render_chart()
        // console.log(moment(date).format('X'))
      })
    },
    render_chart: function(){
      this.render_horizontal_data()
      this.render_top_20_album_bestsaller()
      this.render_genre_chart()
      this.render_sale_on_city_chart()
      this.render_sale_grow_chart()
    },
    render_horizontal_data: function () {
      var self = this;
      $.ajax({
        url: `/horizontal-data?from_date=${self.from_date}&to_date=${self.to_date}&interval=${self.interval}`,
        dataType: "json",
        success: function (data) {
          self.$el.find('#invoice_count').text(data.invoice_count)
          self.$el.find('#invoice_total').text(data.invoice_total.toFixed(3) + ' $')
          self.$el.find('#customer_count').text(data.customer_count)
          self.$el.find('#album_track').text(data.album_count + '/' + data.track_count)
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          // console.log("Before navigate login");
          // self.router.navigate("login");
        }
      });
    },
    render_top_20_album_bestsaller: function () {
      var self = this
      $.ajax({
        url: `/top_20_album_best_seller?from_date=${self.from_date}&to_date=${self.to_date}&interval=${self.interval}`,
        dataType: "json",
        success: function (data) {

          var trace1 = {
            x: data.x,
            y: data.y,
            type: 'bar',
            marker: {
              color: 'rgb(142,124,195)'
            }
          };
          var layout = {
            height: 400,
            width: 800,
            // title: 'Number of Graphs Made this Week',
            font: {
              family: 'Raleway, sans-serif'
            },
            showlegend: false,
            xaxis: {
              tickangle: -45
            },
            yaxis: {
              zeroline: false,
              gridwidth: 2
            },
            bargap: 0.05
          };

          Plotly.newPlot('top_20_album_best_seller', [trace1], layout);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          // console.log("Before navigate login");
          // self.router.navigate("login");
        }
      });

    },
    render_genre_chart: function () {
      let self = this
      $.ajax({
        url: `/percen_genre?from_date=${self.from_date}&to_date=${self.to_date}&interval=${self.interval}`,
        dataType: "json",
        success: function (data) {
          // console.log(data)
          var data_render = [{
            type: "pie",
            values: data.y,
            labels: data.x,
            textinfo: "none",
            insidetextorientation: "radial"
          }]

          var layout = {
            height: 400,
            width: 800,
            // margin: {"t": 0, "b": 0, "l": 0, "r": 0},
            showlegend: true
          }

          Plotly.newPlot('album_genre_chart', data_render, layout)
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          // console.log("Before navigate login");
          // self.router.navigate("login");
        }
      });
    },
    render_sale_on_city_chart: function () {
      var self = this
      $.ajax({
        url: `/sale_city?from_date=${self.from_date}&to_date=${self.to_date}&interval=${self.interval}`,
        dataType: "json",
        success: function (data) {

          var trace1 = {
            x: data.x,
            y: data.y,
            type: 'bar',
            marker: {
              color: 'rgb(26, 118, 255)'
            }
          };
          var layout = {
            height: 400,
            width: 800,
            // title: 'Number of Graphs Made this Week',
            font: {
              family: 'Raleway, sans-serif'
            },
            showlegend: false,
            xaxis: {
              tickangle: -45
            },
            yaxis: {
              title: 'USD',
              zeroline: false,
              gridwidth: 2
            },
            bargap: 0.05
          };

          Plotly.newPlot('sale_city_chart', [trace1], layout);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          // console.log("Before navigate login");
          // self.router.navigate("login");
        }
      });
    },
    render_sale_grow_chart: function () {
      let self = this;
      $.ajax({
        url: `/sale_grow?from_date=${self.from_date}&to_date=${self.to_date}&interval=${self.interval}`,
        dataType: "json",
        success: function (data) {
          // console.log(moment(1230768000*1000).format("YYYY-MM-DD HH:mm:ss"))
          var trace1 = {
            x: data.x.map((item, index) =>moment(item*1000).format("YYYY-MM-DD HH:mm:ss")),
            y: data.invoice_count,
            name: 'Invoice Count',
            type: 'scatter',
            mode: "lines",
          };
          
          var trace2 = {
            x: data.x.map((item, index) =>moment(item*1000).format("YYYY-MM-DD HH:mm:ss")),
            y: data.invoice_total,
            name: 'Invoice Total',
            yaxis: 'y2',
            type: 'scatter',
            mode: "lines",
          };
          
          var data_render = [trace1, trace2];
          
          var layout = {
            title: 'Double Y Axis Example',
            height: 400,
            width: 800,
            xaxis: {
              autorange: true,
              range: ['2009-01-1', '2009-02-1'],
              // rangeselector: {buttons: [
              //     {
              //       count: 1,
              //       label: '1m',
              //       step: 'month',
              //       stepmode: 'backward'
              //     },
              //     {
              //       count: 6,
              //       label: '6m',
              //       step: 'month',
              //       stepmode: 'backward'
              //     },
              //     {step: 'all'}
              //   ]},
              rangeslider: {range: ['2009-01-1', '2009-02-1']},
              type: 'date'
            },
            yaxis: {
              title: 'Invoice Count',
              autorange: true,
            },
            yaxis2: {
              title: 'Invoice Total',
              titlefont: {color: 'rgb(148, 103, 189)'},
              tickfont: {color: 'rgb(148, 103, 189)'},
              overlaying: 'y',
              side: 'right',
              autorange: true,
            }
          };
          
          Plotly.newPlot('sale_grow_chart', data_render, layout);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          // console.log("Before navigate login");
          // self.router.navigate("login");
        }
      });
    }
  });

});