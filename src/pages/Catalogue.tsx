import { useEffect, useMemo, useState } from "react";
import {
  ColumnResizeMode,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import styled from "@emotion/styled";
import { Item } from "../types";
import { useFilter } from "../contexts/FilterContext";
import { Container, Row, ScrollToTopButton, Text } from "../components/common";
import ItemModal from "../components/tps/modal/ItemModal";
import { NO_AUTHOR, NO_CITY, NO_YEAR } from "../constants";
import { joinArr } from "../utils/util.ts";
import { FaBookReader } from "react-icons/fa";
import { SEA_COLOR } from "../utils/colors.ts";

const TableContainer = styled.div`
  overflow-x: auto;

  ::-webkit-scrollbar-track {
    background-color: inherit;
  }

  ::-webkit-scrollbar {
    width: 0.5rem;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #666;
    border-radius: 0.5rem;
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: #666 inherit;
  }

  border-radius: 0.5rem;
  background-color: aliceblue;
  color: black;
  margin: 1rem;
`;

const StyledTable = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.8rem;

  th,
  td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  thead {
    position: sticky;
    top: 0;
    background-color: #f8f9fa;
    z-index: 1;
  }

  tbody tr {
    transition: background-color 0.15s ease;
  }

  tbody tr:hover {
    background-color: #f0f0f0;
  }

  th {
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    position: relative;
    padding-right: 1.5rem;

    &:hover {
      background-color: #eee;
    }

    .resizer {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: rgba(0, 0, 0, 0.05);
      cursor: col-resize;
      user-select: none;
      touch-action: none;

      &:hover {
        background: rgba(0, 0, 0, 0.2);
      }

      &.isResizing {
        background: rgba(0, 0, 0, 0.3);
        opacity: 1;
      }
    }
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;

    th,
    td {
      padding: 0.5rem;
    }
  }
`;

const SortIndicator = styled.span`
  margin-left: 0.5rem;
`;

const ViewButton = styled.button`
  background-color: #f0f0f0;
  color: black;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const LanguageSpan = styled.span`
  display: inline-block;
  margin-right: 0.25rem;
  padding: 0.125rem 0.25rem;
  background-color: #e0e0e0;
  border-radius: 0.25rem;
  font-size: 0.8rem;
`;

function Catalogue() {
  const { filteredItems } = useFilter();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "year", desc: false },
  ]);
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setShowScrollTop(scrollTop > 200);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const columnHelper = createColumnHelper<Item>();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row, {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: (info) => (
          <ViewButton onClick={() => setSelectedItem(info.getValue())}>
            ⤢
          </ViewButton>
        ),
        size: 60,
      }),
      columnHelper.accessor("year", {
        header: "Year",
        cell: (info) => info.getValue() || NO_YEAR,
        size: 60,
      }),
      columnHelper.accessor("cities", {
        header: "Cities",
        cell: (info) => joinArr(info.getValue()) || NO_CITY,
        size: 150,
      }),
      columnHelper.accessor("languages", {
        header: "Languages",
        cell: (info) =>
          info
            .getValue()
            .map((lang, i) => <LanguageSpan key={i}>{lang}</LanguageSpan>),
        size: 200,
      }),
      columnHelper.accessor("authors", {
        header: "Authors",
        cell: (info) => joinArr(info.getValue()) || NO_AUTHOR,
        size: 200,
      }),
      columnHelper.accessor("type", {
        header: "Type",
        size: 60,
      }),
      columnHelper.accessor("format", {
        header: "Format",
        cell: (info) => info.getValue(),
        size: 60,
      }),
      columnHelper.accessor("elementsBooks", {
        header: "Elements Books",
        cell: (info) =>
          info
            .getValue()
            .map((range) =>
              range.start === range.end
                ? range.start
                : `${range.start}-${range.end}`,
            )
            .join(", "),
        size: 120,
      }),
      columnHelper.accessor("volumesCount", {
        header: "Volumes",
        cell: (info) => info.getValue(),
        size: 60,
      }),
      columnHelper.accessor("class", {
        header: "Class",
        cell: (info) => info.getValue(),
        size: 120,
      }),
      columnHelper.accessor("additionalContent", {
        header: "Additional Content",
        cell: (info) => joinArr(info.getValue()),
        size: 250,
      }),
      columnHelper.accessor("scanUrl", {
        header: "Facsimile",
        cell: (info) =>
          info.getValue() && (
            <a
              href={info.getValue() as string}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaBookReader style={{ color: SEA_COLOR }} />
            </a>
          ),
        size: 40,
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    data: filteredItems,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode,
  });

  return (
    <Container>
      {showScrollTop && (
        <ScrollToTopButton onClick={scrollToTop} title="Scroll to top">
          ↑
        </ScrollToTopButton>
      )}

      <Row>
        <Text size={1}>{filteredItems.length} entries found</Text>
      </Row>

      <TableContainer>
        <StyledTable>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <SortIndicator>
                          {{
                            asc: "↑",
                            desc: "↓",
                          }[header.column.getIsSorted() as string] || ""}
                        </SortIndicator>
                      </div>
                    )}
                    <div
                      {...{
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `resizer ${header.column.getIsResizing() ? "isResizing" : ""}`,
                      }}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          features={null}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </Container>
  );
}

export default Catalogue;
