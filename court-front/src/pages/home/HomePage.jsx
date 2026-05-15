import React, {
  useState,
  useEffect,
  useMemo,
  useRef
} from "react";

import { useSearchParams } from "react-router-dom";

import { gql } from "@apollo/client";

import { useQuery } from "@apollo/client/react";

import CaseCard from "../../components/CaseCard";
import Pagination from "../../components/Pagination";
import SearchFilters from "../../components/filters/SearchFilters";

import "../../styles/components.css";

const CASE_OUTCOME_VALUES = {
  UNKNOWN: 0,
  PLAINTIFF_WON: 1,
  DEFENDANT_WON: 2,
  SETTLEMENT: 3,
  CASE_DISMISSED: 4,
  PARTIALLY_GRANTED: 5
};

const OUTCOME_OPTIONS = [
  {
    value: null,
    label: "Любой исход"
  },
  {
    value:
      CASE_OUTCOME_VALUES.PLAINTIFF_WON,
    label: "Истец выиграл"
  },
  {
    value:
      CASE_OUTCOME_VALUES.DEFENDANT_WON,
    label: "Ответчик выиграл"
  },
  {
    value:
      CASE_OUTCOME_VALUES.SETTLEMENT,
    label: "Мировое соглашение"
  },
  {
    value:
      CASE_OUTCOME_VALUES.CASE_DISMISSED,
    label: "Дело прекращено"
  },
  {
    value:
      CASE_OUTCOME_VALUES.PARTIALLY_GRANTED,
    label: "Частично удовлетворено"
  },
  {
    value:
      CASE_OUTCOME_VALUES.UNKNOWN,
    label: "Неизвестно"
  }
];

const DEFAULT_FILTERS = {
  searchText: "",
  caseNumber: "",
  plaintiff: "",
  defendant: "",
  regions: [],
  judgeName: "",
  dateFrom: "",
  dateTo: "",
  dateRanges: [],
  hasDecision: null,
  outcome: null
};

const SEARCH_BY_DECISION_CONTENT = gql`
  query SearchByDecisionContent(
    $searchText: String!
    $first: Int
    $after: String
  ) {
    searchByDecisionContent(
      searchText: $searchText
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          caseNumber
          plaintiff
          defendant
          region
          startDate
          receivedDate
          hasDecision
          judgeName
          courtType
          outcome
        }
      }

      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
      }
    }
  }
`;

const GET_COURT_CASES = gql`
  query GetCourtCases(
    $first: Int
    $after: String
    $where: CourtCaseFilterInput
  ) {
    courtCases(
      first: $first
      after: $after
      where: $where
    ) {
      edges {
        node {
          id
          caseNumber
          plaintiff
          defendant
          region
          startDate
          receivedDate
          hasDecision
          judgeName
          courtType
          outcome
        }
      }

      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
      }
    }
  }
`;

const getOutcomeGraphQLValue = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  switch (value) {
    case 0:
      return "UNKNOWN";

    case 1:
      return "PLAINTIFF_WON";

    case 2:
      return "DEFENDANT_WON";

    case 3:
      return "SETTLEMENT";

    case 4:
      return "CASE_DISMISSED";

    case 5:
      return "PARTIALLY_GRANTED";

    default:
      return null;
  }
};

const serializeFilters = (
  filters
) => {
  const params =
    new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
      if (
        Array.isArray(value) &&
        value.length > 0
      ) {
        params.set(
          key,
          value.join(",")
        );
      } else if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        value !== false
      ) {
        params.set(
          key,
          String(value)
        );
      }
    }
  );

  return params;
};

const deserializeFilters = (
  searchParams
) => {
  const filters = {
    ...DEFAULT_FILTERS
  };

  for (const [
    key,
    value
  ] of searchParams.entries()) {
    if (
      !(key in DEFAULT_FILTERS)
    ) {
      continue;
    }

    if (
      Array.isArray(
        DEFAULT_FILTERS[key]
      )
    ) {
      filters[key] = value
        ? value.split(",")
        : [];
    } else if (
      key === "hasDecision"
    ) {
      filters[key] =
        value === "true"
          ? true
          : value === "false"
          ? false
          : null;
    } else if (
      key === "outcome"
    ) {
      const parsed =
        parseInt(value, 10);

      filters[key] =
        Number.isNaN(parsed)
          ? null
          : parsed;
    } else {
      filters[key] = value;
    }
  }

  return filters;
};

const flattenEdges = (edges) =>
  edges
    ? edges.map((e) => e.node)
    : [];

export default function HomePage() {
  const [
    searchParams,
    setSearchParams
  ] = useSearchParams();

  const resultsContainerRef =
    useRef(null);

  const [filters, setFilters] =
    useState(() =>
      deserializeFilters(
        searchParams
      )
    );

  const [
    activeFilters,
    setActiveFilters
  ] = useState({});

  const [
    searchPerformed,
    setSearchPerformed
  ] = useState(false);

  const [page, setPage] =
    useState(1);

  const [cursors, setCursors] =
    useState([]);

  const casesPerPage = 10;

  useEffect(() => {
    const params =
      serializeFilters(filters);

    if (page > 1) {
      params.set(
        "page",
        page.toString()
      );
    }

    setSearchParams(params, {
      replace: true
    });
  }, [
    filters,
    page,
    setSearchParams
  ]);

  useEffect(() => {
    const restoredFilters =
      deserializeFilters(
        searchParams
      );

    setFilters(restoredFilters);

    const safeFilters = {};

    if (
      restoredFilters.searchText?.trim()
    ) {
      safeFilters.searchText =
        restoredFilters.searchText.trim();
    }

    if (
      restoredFilters.caseNumber?.trim()
    ) {
      safeFilters.caseNumber =
        restoredFilters.caseNumber.trim();
    }

    if (
      restoredFilters.plaintiff?.trim()
    ) {
      safeFilters.plaintiff =
        restoredFilters.plaintiff.trim();
    }

    if (
      restoredFilters.defendant?.trim()
    ) {
      safeFilters.defendant =
        restoredFilters.defendant.trim();
    }

    if (
      restoredFilters.judgeName?.trim()
    ) {
      safeFilters.judgeName =
        restoredFilters.judgeName.trim();
    }

    if (
      restoredFilters.regions
        ?.length > 0
    ) {
      safeFilters.regions =
        restoredFilters.regions;
    }

    if (
      restoredFilters.dateRanges
        ?.length > 0
    ) {
      safeFilters.dateRanges =
        restoredFilters.dateRanges;
    }

    if (
      restoredFilters.dateFrom
    ) {
      safeFilters.dateFrom =
        restoredFilters.dateFrom;
    }

    if (
      restoredFilters.dateTo
    ) {
      safeFilters.dateTo =
        restoredFilters.dateTo;
    }

    if (
      restoredFilters.hasDecision !==
        null &&
      restoredFilters.hasDecision !==
        undefined
    ) {
      safeFilters.hasDecision =
        restoredFilters.hasDecision;
    }

    if (
      restoredFilters.outcome !==
        null &&
      restoredFilters.outcome !==
        undefined
    ) {
      safeFilters.outcome =
        restoredFilters.outcome;
    }

    if (
      Object.keys(safeFilters)
        .length > 0
    ) {
      setActiveFilters(
        safeFilters
      );

      setSearchPerformed(true);
    }

    const savedPage =
      searchParams.get("page");

    if (savedPage) {
      const parsed =
        parseInt(savedPage, 10);

      if (
        !Number.isNaN(parsed)
      ) {
        setPage(parsed);
      }
    }
  }, []);

  const {
    query,
    variables,
    resultField
  } = useMemo(() => {
    const baseVars = {
      first: casesPerPage,

      after:
        page > 1
          ? cursors[page - 2]
          : null
    };

    const isDecisionSearch =
      activeFilters.searchText
        ?.trim()?.length > 0;

    if (isDecisionSearch) {
      return {
        query:
          SEARCH_BY_DECISION_CONTENT,

        resultField:
          "searchByDecisionContent",

        variables: {
          ...baseVars,

          searchText:
            activeFilters.searchText.trim()
        }
      };
    }

    const where = {};

    if (
      activeFilters.regions
        ?.length > 0
    ) {
      where.region = {
        in: activeFilters.regions
      };
    }

    if (
      activeFilters.caseNumber?.trim()
    ) {
      where.caseNumber = {
        contains:
          activeFilters.caseNumber.trim()
      };
    }

    if (
      activeFilters.plaintiff?.trim()
    ) {
      where.plaintiff = {
        contains:
          activeFilters.plaintiff.trim()
      };
    }

    if (
      activeFilters.defendant?.trim()
    ) {
      where.defendant = {
        contains:
          activeFilters.defendant.trim()
      };
    }

    if (
      activeFilters.judgeName?.trim()
    ) {
      where.judgeName = {
        contains:
          activeFilters.judgeName.trim()
      };
    }

    if (
      activeFilters.hasDecision !==
        null &&
      activeFilters.hasDecision !==
        undefined
    ) {
      where.hasDecision = {
        eq:
          activeFilters.hasDecision
      };
    }

    if (
      activeFilters.outcome !==
        null &&
      activeFilters.outcome !==
        undefined
    ) {
      where.outcome = {
        eq:
          getOutcomeGraphQLValue(
            activeFilters.outcome
          )
      };
    }

    const now = new Date();

    let dateFrom =
      activeFilters.dateFrom;

    let dateTo =
      activeFilters.dateTo;

    if (
      activeFilters.dateRanges
        ?.length > 0
    ) {
      const ranges =
        activeFilters.dateRanges;

      if (
        ranges.includes("3months")
      ) {
        const d = new Date();

        d.setMonth(
          d.getMonth() - 3
        );

        dateFrom = d
          .toISOString()
          .split("T")[0];

        dateTo = now
          .toISOString()
          .split("T")[0];
      }

      if (
        ranges.includes("6months")
      ) {
        const d = new Date();

        d.setMonth(
          d.getMonth() - 6
        );

        dateFrom = d
          .toISOString()
          .split("T")[0];

        dateTo = now
          .toISOString()
          .split("T")[0];
      }

      if (
        ranges.includes(
          "currentYear"
        )
      ) {
        const year =
          now.getFullYear();

        dateFrom = `${year}-01-01`;

        dateTo = `${year}-12-31`;
      }

      if (
        ranges.includes("lastYear")
      ) {
        const year =
          now.getFullYear() -
          1;

        dateFrom = `${year}-01-01`;

        dateTo = `${year}-12-31`;
      }
    }

    if (dateFrom || dateTo) {
      where.receivedDate = {};

      if (dateFrom) {
        where.receivedDate.gte =
          `${dateFrom}T00:00:00.000Z`;
      }

      if (dateTo) {
        where.receivedDate.lte =
          `${dateTo}T23:59:59.999Z`;
      }
    }

    return {
      query: GET_COURT_CASES,

      resultField: "courtCases",

      variables: {
        ...baseVars,
        where
      }
    };
  }, [
    activeFilters,
    page,
    cursors
  ]);

  const {
    loading,
    error,
    data,
    refetch
  } = useQuery(query, {
    variables,

    skip: !searchPerformed,

    fetchPolicy:
      "network-only",

    onError: (err) => {
      console.error(err);
    }
  });

  const currentData =
    data?.[resultField];

  const currentCases =
    flattenEdges(
      currentData?.edges
    );

  const pageInfo =
    currentData?.pageInfo;

  const handlePageChange = (
    newPage
  ) => {
    if (
      newPage > page &&
      pageInfo?.endCursor
    ) {
      const nextCursors = [
        ...cursors
      ];

      nextCursors[page - 1] =
        pageInfo.endCursor;

      setCursors(nextCursors);
    }

    setPage(newPage);

    setTimeout(() => {
      resultsContainerRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "start"
        }
      );
    }, 100);
  };

  const handleFilterChange = (
    newFilters
  ) => {
    setFilters(newFilters || {});
  };

  const handleSearch = (
    searchFilters
  ) => {
    const safeFilters = {};

    if (
      searchFilters.searchText?.trim()
    ) {
      safeFilters.searchText =
        searchFilters.searchText.trim();
    }

    if (
      searchFilters.caseNumber?.trim()
    ) {
      safeFilters.caseNumber =
        searchFilters.caseNumber.trim();
    }

    if (
      searchFilters.plaintiff?.trim()
    ) {
      safeFilters.plaintiff =
        searchFilters.plaintiff.trim();
    }

    if (
      searchFilters.defendant?.trim()
    ) {
      safeFilters.defendant =
        searchFilters.defendant.trim();
    }

    if (
      searchFilters.judgeName?.trim()
    ) {
      safeFilters.judgeName =
        searchFilters.judgeName.trim();
    }

    if (
      searchFilters.regions
        ?.length > 0
    ) {
      safeFilters.regions =
        searchFilters.regions;
    }

    if (
      searchFilters.dateRanges
        ?.length > 0
    ) {
      safeFilters.dateRanges =
        searchFilters.dateRanges;
    }

    if (
      searchFilters.dateFrom
    ) {
      safeFilters.dateFrom =
        searchFilters.dateFrom;
    }

    if (
      searchFilters.dateTo
    ) {
      safeFilters.dateTo =
        searchFilters.dateTo;
    }

    if (
      searchFilters.hasDecision !==
        null &&
      searchFilters.hasDecision !==
        undefined
    ) {
      safeFilters.hasDecision =
        searchFilters.hasDecision;
    }

    if (
      searchFilters.outcome !==
        null &&
      searchFilters.outcome !==
        undefined
    ) {
      safeFilters.outcome =
        searchFilters.outcome;
    }

    setPage(1);

    setCursors([]);

    setFilters(searchFilters);

    setActiveFilters(
      safeFilters
    );

    setSearchPerformed(true);
  };

  const handleClearSearch =
    () => {
      setFilters(
        DEFAULT_FILTERS
      );

      setActiveFilters({});

      setSearchPerformed(false);

      setPage(1);

      setCursors([]);

      setSearchParams(
        {},
        {
          replace: true
        }
      );
    };

  return (
    <div className="page-container">
      <SearchFilters
        filters={filters}
        onFiltersChange={
          handleFilterChange
        }
        onSearch={handleSearch}
        onClear={
          handleClearSearch
        }
        compact={false}
        outcomeOptions={
          OUTCOME_OPTIONS
        }
      />

      {searchPerformed && (
        <div
          ref={
            resultsContainerRef
          }
        >
          {loading && (
            <div className="text-center py-8">
              <div className="spinner mx-auto"></div>

              <p className="mt-4">
                Загрузка судебных
                дел...
              </p>
            </div>
          )}

          {error && (
            <div className="text-body text-error">
              <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                <p className="font-bold">
                  Ошибка загрузки
                </p>

                <p className="mt-2">
                  {error.message}
                </p>

                <button
                  className="button button-primary mt-4"
                  onClick={() =>
                    refetch()
                  }
                >
                  Повторить запрос
                </button>

                <button
                  className="button button-clear ml-2 mt-4"
                  onClick={
                    handleClearSearch
                  }
                >
                  Очистить фильтры
                </button>
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            currentCases?.length >
              0 && (
              <>
                <div className="case-list mb-lg">
                  {currentCases.map(
                    (
                      courtCase
                    ) => (
                      <CaseCard
                        key={
                          courtCase.id
                        }
                        courtCase={
                          courtCase
                        }
                      />
                    )
                  )}
                </div>

                <Pagination
                  currentPage={page}
                  hasNextPage={
                    pageInfo?.hasNextPage
                  }
                  hasPreviousPage={
                    pageInfo?.hasPreviousPage
                  }
                  onPageChange={
                    handlePageChange
                  }
                />
              </>
            )}

          {!loading &&
            !error &&
            currentCases?.length ===
              0 && (
              <div className="no-results text-center py-12">
                <h3>
                  Ничего не найдено
                </h3>

                <p className="text-gray-600 mt-2 mb-4">
                  Попробуйте
                  изменить параметры
                  поиска
                </p>

                <button
                  className="button button-primary"
                  onClick={
                    handleClearSearch
                  }
                >
                  Очистить фильтры
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}