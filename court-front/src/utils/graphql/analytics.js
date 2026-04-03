// src/graphql/queries/analytics.js
import { gql } from '@apollo/client';

export const GET_TOTAL_CASES_STATS = gql`
  query GetTotalCasesStats {
    totalCasesStats {
      totalCases
      totalCasesWithDecision
      decisionPercentage
      calculatedAt
    }
  }
`;

export const GET_CASES_BY_REGION = gql`
  query GetCasesByRegionStats {
    casesByRegionStats(order: { casesInRegion: DESC }) {
      region
      federalDistrict
      casesInRegion
      percentageOfTotal
    }
  }
`;

export const GET_DECISION_STATS = gql`
  query GetDecisionStats($region: String) {
    decisionStats(where: { region: { eq: $region } }) {
      region
      federalDistrict
      totalCases
      casesWithDecision
      decisionRate
    }
  }
`;

export const GET_OUTCOME_STATS = gql`
  query GetOutcomeStats($region: String) {
    outcomeStats(where: { region: { eq: $region } }) {
      region
      federalDistrict
      casesWithKnownOutcome
      plaintiffWins
      plaintiffWinPercentage
      defendantWins
      defendantWinPercentage
      settlements
      settlementPercentage
      dismissed
      dismissedPercentage
    }
  }
`;

export const GET_TOP_REGIONS_BY_CASES = gql`
  query GetTopRegionsByCases($limit: Int = 10) {
    topRegionsByCases(limit: $limit) {
      region
      casesInRegion
      percentageOfTotal
    }
  }
`;

export const GET_TOP_REGIONS_BY_PLAINTIFF_WIN = gql`
  query GetTopRegionsByPlaintiffWinRate($limit: Int = 10, $minCases: Int = 10) {
    topRegionsByPlaintiffWinRate(limit: $limit, minCases: $minCases) {
      region
      plaintiffWinPercentage
      plaintiffWins
      casesWithKnownOutcome
    }
  }
`;

export const GET_ANALYTICS_DASHBOARD = gql`
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
        decisionRate
      }
      outcomeStats {
        region
        plaintiffWinPercentage
        defendantWinPercentage
        settlementPercentage
        dismissedPercentage
      }
      calculatedAt
    }
  }
`;