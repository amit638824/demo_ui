"use client";
import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

interface ColumnType {
  field: string;
  header: string;
  sortable?: boolean;
  filter?: boolean;
}

interface CustomDataTableProps {
  data: any[];
  totalRecords: number;
  loading: boolean;
  lazyParams: any;
  pageSizeOptions?: number[];
  columns: ColumnType[];
  onPage: (event: any) => void;
  onSort: (event: any) => void;
  onFilter: (event: any) => void;
  header?: React.ReactNode;
  onEdit?: (rowData: any) => void;
  onDelete?: (rowData: any) => void;
}

const CustomDataTable: React.FC<CustomDataTableProps> = ({
  data,
  totalRecords,
  loading,
  lazyParams,
  pageSizeOptions = [10, 20, 50, 100],
  columns,
  onPage,
  onSort,
  onFilter,
  header,
  onEdit,
  onDelete,
}) => {
  return (
    <DataTable
      value={data}
      lazy
      paginator
      first={lazyParams.page * lazyParams.rows}
      rows={lazyParams.rows}
      rowsPerPageOptions={pageSizeOptions}
      totalRecords={totalRecords}
      onPage={onPage}
      onSort={onSort}
      onFilter={onFilter}
      sortField={lazyParams.sortField}
      sortOrder={lazyParams.sortOrder}
      header={header}
      filterDisplay="row"
      resizableColumns
      reorderableColumns
      stripedRows
      showGridlines
      loading={loading}
    >
     {columns.map((col) => (
  <Column
    key={col.field}
    field={col.field}
    header={col.header}
    sortable={col.sortable !== false}
    filter={col.filter !== false}
    filterPlaceholder={`Search ${col.header}`}
    body={(col as any).body}   // 🔥 THIS LINE
  />
))}

      {/* Actions column */}
      {(onEdit || onDelete) && (
        <Column
          header="Actions"
          body={(rowData) => (
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  icon="pi pi-pencil"
                  className="p-button-sm p-button-warning"
                  onClick={() => onEdit(rowData)}
                />
              )}
              {onDelete && (
                <Button
                  icon="pi pi-trash"
                  className="p-button-sm p-button-danger"
                  onClick={() => onDelete(rowData)}
                />
              )}
            </div>
          )}
        />
      )}
    </DataTable>
  );
};

export default CustomDataTable;


// "use client";
// import React, { useEffect, useState, useMemo } from "react";
// import { MultiSelect } from "primereact/multiselect";
// import { Button } from "primereact/button";
// import Loader from "@/ui/common/loader/Loader";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import CustomDataTable from "@/components/Common/CustomDataTable";
// import { showAlert, showConfirmAlert } from "@/utils/swalFire";
// import { deleteJobPstedServices, recruiterjObListService } from "@/services/RecruiterService";
// import { useRouter } from "next/navigation";

// // Date formatting utility function
// export const formatDateTime = (value?: string) => {
//   if (!value) return "-";

//   const date = new Date(value);
//   return date.toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// };

// // Only date format (without time)
// export const formatDate = (value?: string) => {
//   if (!value) return "-";

//   const date = new Date(value);
//   return date.toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };

// const RecruiterJobList = () => {
//   const [rowsData, setRowsData] = useState<any[]>([]);
//   const [allJobsData, setAllJobsData] = useState<any[]>([]); // Store all data for client-side operations
//   const [totalRecords, setTotalRecords] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const [lazyParams, setLazyParams] = useState<any>({
//     page: 0,
//     rows: 10,
//     sortField: "created_at",
//     sortOrder: -1,
//     filters: {},
//   });

//   const columns = [
//     { field: "job_id", header: "Job ID", sortable: true },
//     { field: "job_title_name", header: "Title", sortable: true },
//     { field: "category_name", header: "Category", sortable: true },
//     { field: "city_name", header: "City", sortable: true },
//     { field: "locality_name", header: "Locality", sortable: true },
//     { field: "job_type_name", header: "Job Type", sortable: true },
//     { field: "salary_min", header: "Min Salary", sortable: true },
//     { field: "salary_max", header: "Max Salary", sortable: true },
//     { field: "created_at", header: "Created At", sortable: true, filter: false, body: (rowData: any) => { return formatDate(rowData.created_at); } }
//   ];

//   const [visibleColumns, setVisibleColumns] = useState(columns);

//   // ================= API =================
//   const loadData = async () => {
//     setLoading(true);
//     const page = lazyParams.page + 1;
//     const limit = lazyParams.rows;

//     const buildQuery = (params: Record<string, any>) => {
//       const query = new URLSearchParams();
//       Object.entries(params).forEach(([key, value]) => {
//         if (value !== null && value !== undefined && value !== "") {
//           query.append(key, String(value));
//         }
//       });
//       return query.toString();
//     };

//     // Extract filter values from DataTable filters for API call
//     const getFilterValue = (fieldName: string) => {
//       const filter = lazyParams.filters[fieldName];
//       return filter?.value || null;
//     };

//     const query = buildQuery({
//       page,
//       limit,
//       recruiterId: 1,
//       id: getFilterValue("job_id"),
//       titleName: getFilterValue("job_title_name"),
//       categoryName: getFilterValue("category_name"),
//       cityName: getFilterValue("city_name"),
//       localityName: getFilterValue("locality_name"),
//       pinCode: getFilterValue("pin_code"),
//       jobTypeName: getFilterValue("job_type_name"),
//       qualification: getFilterValue("qualification"),
//       salaryMin: getFilterValue("salary_min"),
//       salaryMax: getFilterValue("salary_max"),
//     });

//     try {
//       const res = await recruiterjObListService(query);
//       const fetchedData = res?.data?.items || [];

//       // Store all data for client-side sorting/filtering
//       if (page === 1) {
//         setAllJobsData(fetchedData);
//       } else {
//         setAllJobsData(prev => [...prev, ...fetchedData]);
//       }

//       setRowsData(fetchedData);
//       setTotalRecords(res?.data?.totalRecords || 0);
//     } catch (error) {
//       console.error("Error loading data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data on initial load and when filters change
//   useEffect(() => {
//     loadData();
//   }, [lazyParams.page, lazyParams.rows, lazyParams.filters]);

//   // Apply client-side sorting to the data
//   const sortedAndFilteredData = useMemo(() => {
//     let data = [...allJobsData];

//     // Apply filters
//     const filters = lazyParams.filters;
//     Object.keys(filters).forEach((field) => {
//       const filter = filters[field];
//       if (filter && filter.value) {
//         const filterValue = filter.value.toString().toLowerCase();
//         data = data.filter(item => {
//           const itemValue = item[field]?.toString().toLowerCase() || '';
//           return itemValue.includes(filterValue);
//         });
//       }
//     });

//     // Apply sorting
//     if (lazyParams.sortField) {
//       data.sort((a, b) => {
//         let aValue = a[lazyParams.sortField];
//         let bValue = b[lazyParams.sortField];

//         // Special handling for created_at field
//         if (lazyParams.sortField === "created_at") {
//           aValue = new Date(aValue).getTime();
//           bValue = new Date(bValue).getTime();
//         }

//         // Handle null/undefined values
//         if (aValue === null || aValue === undefined) aValue = '';
//         if (bValue === null || bValue === undefined) bValue = '';

//         // Convert to string for comparison if needed
//         if (typeof aValue === 'number' && typeof bValue === 'number') {
//           return lazyParams.sortOrder === 1 ? aValue - bValue : bValue - aValue;
//         }

//         const comparison = aValue.toString().localeCompare(bValue.toString());
//         return lazyParams.sortOrder === 1 ? comparison : -comparison;
//       });
//     }

//     return data;
//   }, [allJobsData, lazyParams.sortField, lazyParams.sortOrder, lazyParams.filters]);

//   // Slice data for pagination
//   const paginatedData = useMemo(() => {
//     const start = lazyParams.page * lazyParams.rows;
//     const end = start + lazyParams.rows;
//     return sortedAndFilteredData.slice(start, end);
//   }, [sortedAndFilteredData, lazyParams.page, lazyParams.rows]);

//   // ================= CLIENT-SIDE EVENTS =================
//   const onPage = (event: any) => {
//     setLazyParams((prev: any) => ({
//       ...prev,
//       page: event.page,
//       rows: event.rows
//     }));
//   };

//   const onSort = (event: any) => {
//     setLazyParams((prev: any) => ({
//       ...prev,
//       page: 0, // Reset to first page when sorting
//       sortField: event.sortField,
//       sortOrder: event.sortOrder
//     }));
//   };

//   const onFilter = (event: any) => {
//     setLazyParams((prev: any) => ({
//       ...prev,
//       page: 0, // Reset to first page when filtering
//       filters: event.filters
//     }));
//   };

//   const onColumnToggle = (e: any) => {
//     const selected = e.value;
//     const ordered = columns.filter((col) => selected.some((s: any) => s.field === col.field));
//     setVisibleColumns(ordered);
//   };

//   const handleDelete = async (rowData: any) => {
//     const confirmed = await showConfirmAlert({
//       title: "Delete Job?",
//       text: "This action cannot be undone",
//       confirmText: "Yes, delete",
//     });

//     if (!confirmed) return;

//     try {
//       const res = await deleteJobPstedServices(rowData?.job_id);
//       if (res?.success) {
//         showAlert("success", res.message || "Deleted successfully");
//         // Remove from client-side data
//         setAllJobsData(prev => prev.filter(job => job.job_id !== rowData.job_id));
//       } else {
//         showAlert("error", res?.message || "Delete failed");
//       }
//     } catch (error: any) {
//       showAlert("error", error?.message || "Server error");
//     }
//   };

//   const handleJobEdit = (job: any) => {
//     localStorage.setItem("jobUpdate", JSON.stringify(job));
//     router.push("/recruiter/job/update");
//   };

//   const exportExcel = () => {
//     // Format dates in the data before exporting
//     const formattedData = sortedAndFilteredData.map(item => ({
//       ...item,
//       created_at: formatDateTime(item.created_at)
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(formattedData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     saveAs(new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "recruiter-jobs.xlsx");
//   };

//   const header = (
//     <div className="flex flex-wrap gap-2 mb-3">
//       <h1 className="text-center text-">Job List</h1>
//       <MultiSelect
//         value={visibleColumns}
//         options={columns}
//         optionLabel="header"
//         onChange={onColumnToggle}
//         placeholder="Columns"
//         display="chip"
//         className="w-full md:w-64"
//       />
//       <Button
//         icon="pi pi-file-excel"
//         label="Export"
//         onClick={exportExcel}
//         className="p-button-warning text-light ms-3"
//       />
//     </div>
//   );

//   return (
//     <div style={{ position: "relative" }}>
//       {loading && <Loader />}
//       <CustomDataTable
//         data={paginatedData}
//         totalRecords={sortedAndFilteredData.length}
//         loading={loading}
//         lazyParams={lazyParams}
//         columns={visibleColumns}
//         onPage={onPage}
//         onSort={onSort}
//         onFilter={onFilter}
//         header={header}
//         onEdit={handleJobEdit}
//         onDelete={handleDelete}
//       />
//     </div>
//   );
// };

// export default RecruiterJobList;