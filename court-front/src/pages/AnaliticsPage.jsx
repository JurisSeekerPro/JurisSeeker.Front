import React, { useState } from 'react';
import { useQuery } from "@apollo/client/react";
import { useNavigate } from 'react-router-dom'; 

import { gql } from "@apollo/client";
import StatsCard from '../components/analytics/StatsCard';
import RegionTable from '../components/analytics/RegionTable';
import Chart from '../components/analytics/Chart';
import '../styles/AnalyticsPage.css';

// GraphQL запросы
const GET_ANALYTICS_DASHBOARD = gql`
  query GetAnalyticsDashboard {
    analyticsDashboard {
      totalStats {
        totalCases
        totalCasesWithDecision
        decisionPercentage
        calculatedAt
      }
      regionStats {
        region
        federalDistrict
        casesInRegion
        percentageOfTotal
      }
      decisionStats {
        region
        federalDistrict
        totalCases
        casesWithDecision
        decisionRate
      }
      outcomeStats {
        region
        federalDistrict
        casesWithKnownOutcome
        plaintiffWins
        plaintiffWinPercentage
        defendantWins
        defendantWinPercentage
        settlementPercentage
        dismissedPercentage
      }
      calculatedAt
    }
  }
`;

const AnalyticsPage = () => {
  const navigate = useNavigate(); 

  const [limit, setLimit] = useState(10);

  const { loading, error, data } = useQuery(GET_ANALYTICS_DASHBOARD, {
    fetchPolicy: 'cache-and-network'
  });

  const safeNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return value;
  };

  const safePercent = (value) => {
    const num = safeNumber(value);
    return `${num.toFixed(2)}%`;
  };

  const safeLocale = (value) => {
    return safeNumber(value).toLocaleString();
  };

  if (loading) {
    return <div className="analytics-loading">Загрузка аналитики...</div>;
  }
  
  if (error) {
    console.error("GraphQL Error:", error);
    return (
      <div className="analytics-error">
        <h3>Ошибка загрузки данных</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const dashboard = data?.analyticsDashboard || {};
  const totalStats = dashboard.totalStats || {};
  
  const regionStats = (dashboard.regionStats || []).filter(r => r != null);
  const decisionStats = (dashboard.decisionStats || []).filter(d => d != null);
  const outcomeStats = (dashboard.outcomeStats || []).filter(o => o != null);

  const regionCasesChart = regionStats
    .filter(r => r.region)
    .map(r => ({
      label: r.region || 'Неизвестно',
      value: safeNumber(r.casesInRegion)
    }))
    .sort((a, b) => b.value - a.value);

  const outcomeChart = outcomeStats
    .filter(r => r.region)
    .map(r => ({
      label: r.region || 'Неизвестно',
      value: safeNumber(r.plaintiffWinPercentage),
      color: '#4caf50'
    }))
    .sort((a, b) => b.value - a.value);

  const avgDecisionRate = decisionStats.length > 0
    ? Math.round(
        decisionStats.reduce((acc, d) => acc + safeNumber(d.decisionRate), 0) / decisionStats.length
      )
    : 0;

  return (
    <div className="analytics-page">
      <div className="analytics-header-actions">
      
        <div className="analytics-header">
          <h1>Аналитика судебных дел</h1>
          <div className="analytics-date">
            Обновлено: {totalStats.calculatedAt 
              ? new Date(totalStats.calculatedAt).toLocaleString('ru-RU')
              : 'нет данных'}
          </div>
        </div>
      </div>

      <div className="analytics-cards">
        <StatsCard
          title="Всего дел"
          value={safeLocale(totalStats.totalCases)}
          subtitle="Общее количество"
          icon="📊"
          color="#4361ee"
        />
        <StatsCard
          title="Дела с решениями"
          value={safeLocale(totalStats.totalCasesWithDecision)}
          subtitle={`${safeNumber(totalStats.decisionPercentage).toFixed(2)}% от всех дел`}
          icon="⚖️"
          color="#4caf50"
        />
        <StatsCard
          title="Регионов"
          value={regionStats.length}
          subtitle="Субъектов РФ"
          icon="🗺️"
          color="#ff9800"
        />
        <StatsCard
          title="Средний % решений"
          value={`${avgDecisionRate}%`}
          subtitle="По всем регионам"
          icon="📈"
          color="#9c27b0"
        />
      </div>

      <div className="analytics-charts">
        <div className="chart-wrapper">
          <Chart 
            data={regionCasesChart.slice(0, 10)} 
            title="Топ-10 регионов по количеству дел"
          />
        </div>
        <div className="chart-wrapper">
          <Chart 
            data={outcomeChart.slice(0, 10)} 
            title="Топ-10 регионов по победам истцов (%)"
          />
        </div>
      </div>

      <div className="analytics-section">
        <div className="section-header">
          <h2>Статистика по регионам</h2>
          <select 
            className="limit-select"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>5 регионов</option>
            <option value={10}>10 регионов</option>
            <option value={20}>20 регионов</option>
            <option value={50}>50 регионов</option>
          </select>
        </div>
        
        <RegionTable 
          data={regionStats.slice(0, limit)}
          columns={[
            { 
              key: 'region', 
              label: 'Регион',
              render: (value) => value || '—'
            },
            { 
              key: 'federalDistrict', 
              label: 'Федеральный округ',
              render: (value) => value || '—'
            },
            { 
              key: 'casesInRegion', 
              label: 'Количество дел',
              render: (value) => safeLocale(value)
            },
            { 
              key: 'percentageOfTotal', 
              label: '% от всех дел',
              render: (value) => {
                const val = safeNumber(value);
                return (
                  <div className="percentage-cell">
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${val}%` }}
                      />
                    </div>
                    <span>{val.toFixed(2)}%</span>
                  </div>
                );
              }
            }
          ]}
        />
      </div>

       <div className="analytics-section">
        <h2>Исходы дел по регионам</h2>
        <RegionTable 
          data={outcomeStats.slice(0, limit)}
          columns={[
            { 
              key: 'region', 
              label: 'Регион',
              render: (value) => value || '—'
            },
            { 
              key: 'plaintiffWinPercentage', 
              label: 'Победы истцов',
              render: (value) => safePercent(value)
            },
            { 
              key: 'defendantWinPercentage', 
              label: 'Победы ответчиков',
              render: (value) => safePercent(value)
            },
            { 
              key: 'settlementPercentage', 
              label: 'Мировые',
              render: (value) => safePercent(value)
            },
            { 
              key: 'dismissedPercentage', 
              label: 'Прекращены',
              render: (value) => safePercent(value)
            }
          ]}
        />
      </div> 

       <div className="analytics-section">
        <h2>Детальная статистика исходов</h2>
        <RegionTable 
          data={outcomeStats.slice(0, limit)}
          columns={[
            { 
              key: 'region', 
              label: 'Регион',
              render: (value) => value || '—'
            },
            { 
              key: 'casesWithKnownOutcome', 
              label: 'Дела с исходом',
              render: (value) => safeLocale(value)
            },
            { 
              key: 'plaintiffWins', 
              label: 'Побед истцов',
              render: (value) => safeLocale(value)
            },
            { 
              key: 'defendantWins', 
              label: 'Побед ответчиков',
              render: (value) => safeLocale(value)
            }
          ]}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;