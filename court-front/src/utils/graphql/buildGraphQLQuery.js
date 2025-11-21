// src/utils/graphql/buildGraphQLQuery.js

/**
 * Формирует GraphQL-запрос для поиска судебных дел по фильтрам
 * @param {Object} filters - объект фильтров
 * @returns {{ query: string, variables: Object }}
 */
export const buildGraphQLSearchQuery = (filters) => {
  const variables = {};

  // Строим input для GraphQL
  const inputFields = [];

  if (filters.searchText) {
    variables.searchText = filters.searchText;
    inputFields.push('searchText: $searchText');
  }

  if (filters.caseNumber) {
    variables.caseNumber = filters.caseNumber;
    inputFields.push('caseNumber: $caseNumber');
  }

  if (filters.plaintiff) {
    variables.plaintiff = filters.plaintiff;
    inputFields.push('plaintiff: $plaintiff');
  }

  if (filters.defendant) {
    variables.defendant = filters.defendant;
    inputFields.push('defendant: $defendant');
  }

  if (filters.regions && filters.regions.length > 0) {
    variables.regions = filters.regions;
    inputFields.push('regions: $regions');
  }

  if (filters.courtTypes && filters.courtTypes.length > 0) {
    variables.courtTypes = filters.courtTypes;
    inputFields.push('courtTypes: $courtTypes');
  }

  if (filters.articles && filters.articles.length > 0) {
    variables.articles = filters.articles;
    inputFields.push('articles: $articles');
  }

  if (filters.startDate) {
    variables.startDate = filters.startDate;
    inputFields.push('startDate: $startDate');
  }

  if (filters.endDate) {
    variables.endDate = filters.endDate;
    inputFields.push('endDate: $endDate');
  }

  if (filters.decisionStartDate) {
    variables.decisionStartDate = filters.decisionStartDate;
    inputFields.push('decisionStartDate: $decisionStartDate');
  }

  if (filters.decisionEndDate) {
    variables.decisionEndDate = filters.decisionEndDate;
    inputFields.push('decisionEndDate: $decisionEndDate');
  }

  if (filters.hasDecision !== undefined && filters.hasDecision !== '') {
    variables.hasDecision = filters.hasDecision;
    inputFields.push('hasDecision: $hasDecision');
  }

  if (filters.legalNorms) {
    variables.legalNorms = filters.legalNorms;
    inputFields.push('legalNorms: $legalNorms');
  }

  // Формируем сам GraphQL-запрос
  const query = `
    query SearchCourtDecisions(${Object.keys(variables).map(k => `$${k}: ${getGraphQLType(filters[k])}`).join(', ')}) {
      searchCourtDecisions(input: { ${inputFields.join(', ')} }) {
        id
        caseNumber
        caseText
        plaintiff
        defendant
        region
        courtType
        articles
        decisionDate
        hasDecision
      }
    }
  `;

  return { query, variables };
};

/**
 * Определяет GraphQL тип переменной на основе значения
 * @param {any} value 
 * @returns {string} GraphQL тип
 */
const getGraphQLType = (value) => {
  if (Array.isArray(value)) return '[String!]';
  if (typeof value === 'boolean') return 'Boolean';
  return 'String';
};
