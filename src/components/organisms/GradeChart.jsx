import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const GradeChart = ({ 
  grades, 
  students,
  className,
  type = "line"
}) => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {}
  });
  
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [chartType, setChartType] = useState(type);

  useEffect(() => {
    if (grades.length === 0) return;

    const subjects = [...new Set(grades.map(g => g.subject))];
    const filteredGrades = selectedSubject === "all" 
      ? grades 
      : grades.filter(g => g.subject === selectedSubject);

    if (chartType === "line") {
      // Line chart showing grade trends over time
      const seriesData = subjects.map(subject => {
        const subjectGrades = filteredGrades.filter(g => g.subject === subject);
        const sortedGrades = subjectGrades.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return {
          name: subject,
          data: sortedGrades.map(g => ({
            x: new Date(g.date).getTime(),
            y: Math.round((g.score / g.maxScore) * 100)
          }))
        };
      });

      setChartData({
        series: selectedSubject === "all" ? seriesData : seriesData.filter(s => s.name === selectedSubject),
        options: {
          chart: {
            type: "line",
            toolbar: { show: false },
            zoom: { enabled: false }
          },
          colors: ["#2563eb", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"],
          stroke: {
            curve: "smooth",
            width: 3
          },
          xaxis: {
            type: "datetime",
            labels: {
              format: "MMM dd"
            }
          },
          yaxis: {
            min: 0,
            max: 100,
            labels: {
              formatter: (val) => `${val}%`
            }
          },
          tooltip: {
            x: {
              format: "MMM dd, yyyy"
            },
            y: {
              formatter: (val) => `${val}%`
            }
          },
          grid: {
            borderColor: "#e5e7eb",
            strokeDashArray: 5
          },
          legend: {
            position: "top",
            horizontalAlign: "right"
          }
        }
      });
    } else {
      // Bar chart showing average grades by subject
      const subjectAverages = subjects.map(subject => {
        const subjectGrades = filteredGrades.filter(g => g.subject === subject);
        const average = subjectGrades.reduce((sum, g) => sum + (g.score / g.maxScore * 100), 0) / subjectGrades.length;
        return {
          subject,
          average: Math.round(average)
        };
      });

      setChartData({
        series: [{
          name: "Average Grade",
          data: subjectAverages.map(s => s.average)
        }],
        options: {
          chart: {
            type: "bar",
            toolbar: { show: false }
          },
          colors: ["#2563eb"],
          plotOptions: {
            bar: {
              borderRadius: 8,
              distributed: true
            }
          },
          xaxis: {
            categories: subjectAverages.map(s => s.subject)
          },
          yaxis: {
            min: 0,
            max: 100,
            labels: {
              formatter: (val) => `${val}%`
            }
          },
          tooltip: {
            y: {
              formatter: (val) => `${val}%`
            }
          },
          grid: {
            borderColor: "#e5e7eb",
            strokeDashArray: 5
          },
          legend: {
            show: false
          }
        }
      });
    }
  }, [grades, selectedSubject, chartType]);

  const subjects = [...new Set(grades.map(g => g.subject))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("card p-6", className)}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-gray-800">
          Grade Performance
        </h3>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-field py-2 px-3 text-sm"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <Button
              variant={chartType === "line" ? "primary" : "ghost"}
              onClick={() => setChartType("line")}
              className="px-3 py-2 text-sm rounded-none"
            >
              <ApperIcon name="TrendingUp" className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === "bar" ? "primary" : "ghost"}
              onClick={() => setChartType("bar")}
              className="px-3 py-2 text-sm rounded-none"
            >
              <ApperIcon name="BarChart3" className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <Chart
          options={chartData.options}
          series={chartData.series}
          type={chartType}
          height="100%"
        />
      </div>
    </motion.div>
  );
};

export default GradeChart;