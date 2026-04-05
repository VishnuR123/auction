import { useEffect, useMemo, useState } from "react";

/**
 * Controlled Table pagination so page-size changes work (static `pageSize` breaks the dropdown).
 * @param {string|number} resetKey when this value changes, current page resets to 1
 */
export function useTablePagination(resetKey, defaultPageSize = 15) {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  useEffect(() => {
    setCurrent(1);
  }, [resetKey]);

  const pagination = useMemo(
    () => ({
      current,
      pageSize,
      showSizeChanger: true,
      pageSizeOptions: [10, 15, 20, 50, 100],
      showTotal: (total) => `Total ${total}`,
      onChange: (page, size) => {
        setCurrent(page);
        if (size != null) setPageSize(size);
      },
      onShowSizeChange: (_page, size) => {
        setPageSize(size);
        setCurrent(1);
      },
    }),
    [current, pageSize]
  );

  return pagination;
}
