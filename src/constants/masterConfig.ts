import {
  masterBenifitsService,
  masterCategoryService,
  masterCityService,
  masterLocalityService,
  masterJobTitleService,
  masterJobSKillsService,
  masterRolesService,
  masterDocumentService,
  masterJobTypeService,
  masterSalaryTypeService,
  masterExperienceService,
  advertisementCreditMappingService,
  masterSubscriptionService,
} from "@/services/SuperAdminMasterData";

import { createCrudService } from "@/services/masterCrud";

/* ---------------- TYPES ---------------- */

export type ListColumn = {
  key: string;
  label: string;
};

export type FormField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "file" | "radio";
  required?: boolean;
  options?: { label: string; value: any }[];

  /* ✅ Dependency metadata */
  dependsOn?: "state" | "city" | "role" | "category";
};

export type MasterConfigType = {
  key: string;
  label: string;
  service: (page: number, limit: number, search?: string) => Promise<any>;
  addService: (payload: any) => Promise<any>;
  updateService: (id: number, payload: any) => Promise<any>;
  deleteService: (id: number) => Promise<any>;
  listColumns: ListColumn[];
  formFields: FormField[];
};

/* ---------------- CRUD INSTANCES ---------------- */
const benifitCrud = createCrudService("/api/master-job-benifits");
const categoryCrud = createCrudService("/api/master-category");
const cityCrud = createCrudService("/api/master-city");
const localityCrud = createCrudService("/api/master-locality");
const jobTitleCrud = createCrudService("/api/master-job-title");
const skillsCrud = createCrudService("/api/master-skills");
const rolesCrud = createCrudService("/api/master-roles");
const documentCrud = createCrudService("/api/master-document");
const jobTypeCrud = createCrudService("/api/master-job-type");
const salaryTypeCrud = createCrudService("/api/master-salary-type");
const experienceCrud = createCrudService("/api/master-experience");
const adCreditMappingCrud = createCrudService("/api/advertisement-credit");
const subscriptionCrud = createCrudService("/api/master-subscription");




/* ---------------- CONFIG ---------------- */

export const MASTER_TYPES: MasterConfigType[] = [
  /* ================= CATEGORY ================= */
  {
    key: "category",
    label: "Categories",
    service: (page, limit, search = "") => masterCategoryService(page, limit, search),
    addService: categoryCrud.create,
    updateService: categoryCrud.update,
    deleteService: categoryCrud.remove,
    listColumns: [
      { key: "name", label: "Name" },
      { key: "image", label: "Image" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },

      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],
    formFields: [
      { name: "name", label: "Category Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Image", type: "file" },
    ],
  },

  /* ================= CITY ================= */
  {
    key: "city",
    label: "City",
    service: (page, limit, search = "") => masterCityService(page, limit, search),
    addService: cityCrud.create,
    updateService: cityCrud.update,
    deleteService: cityCrud.remove,

    /* ✅ SHOW STATE NAME */
    listColumns: [
      { key: "name", label: "City Name" },
      { key: "stateName", label: "State" },
      { key: "code", label: "Code" },
      { key: "latitude", label: "Latitude" },
      { key: "longitude", label: "Longitude" },
      { key: "cityImage", label: "Image" }, // or profilePic based on API
      { key: "status", label: "Status" },
      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],

    /* ✅ STATE DROPDOWN */
    formFields: [
      { name: "name", label: "City Name", type: "text", required: true },
      { name: "code", label: "City Code", type: "text", required: true },
      {
        name: "stateId",
        label: "State",
        type: "select",
        required: true,
        dependsOn: "state",
      },
      {
        name: "latitude",
        label: "Latitude",
        type: "number",
      },
      {
        name: "longitude",
        label: "Longitude",
        type: "number",
      },
      {
        name: "cityImage", // should match backend key
        label: "City Image",
        type: "file",
      },
    ],
  },

  /* ================= RECRUITER DOCUMENT ================= */
  {
    key: "document_type",
    label: "Document Type",

    service: (page, limit, search = "") => masterDocumentService(page, limit, search),

    addService: documentCrud.create,
    updateService: documentCrud.update,
    deleteService: documentCrud.remove,

    /* LIST */
    listColumns: [
      { key: "name", label: "Document Name" },
      { key: "roleNames", label: "Roles" }, // ✅ MULTIPLE ROLES
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },

      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],

    /* ADD / EDIT */
    formFields: [
      {
        name: "name",
        label: "Document Name",
        type: "text",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
      },
      {
        name: "image",
        label: "Document Image",
        type: "file",
      },
      {
        name: "roleIds", // ✅ ARRAY
        label: "Roles",
        type: "select",
        required: true,
        dependsOn: "role",
        options: [], // handled dynamically
      },
    ],
  },

  /* ================= Experience ================= */
  {
    key: "experience",
    label: "Experience",

    service: (page, limit, search = "") => masterExperienceService(page, limit, search),

    addService: experienceCrud.create,
    updateService: experienceCrud.update,
    deleteService: experienceCrud.remove,

    /* LIST */
    listColumns: [
      { key: "name", label: "Experience Level" },
      { key: "minYears", label: "Min Years" },
      { key: "maxYears", label: "Max Years" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },
      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],

    /* ADD / EDIT */
    formFields: [
      {
        name: "name",
        label: "Experience Name",
        type: "text",
        required: true,
      },
      {
        name: "minYears",
        label: "Minimum Years",
        type: "number",
      },
      {
        name: "maxYears",
        label: "Maximum Years",
        type: "number",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
      },
    ],
  },

  /* ================= Job Benefit ================= */
  {
    key: "jobBenefits",
    label: "Job Benefit",
    service: (page, limit, search = "") => masterBenifitsService(page, limit, search),
    addService: benifitCrud.create,
    updateService: benifitCrud.update,
    deleteService: benifitCrud.remove,
    listColumns: [
      { key: "name", label: "Name" },
      { key: "categoryNames", label: "Category" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },

      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],
    formFields: [
      { name: "name", label: "Benefit", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "categoryIds",
        label: "Categories",
        type: "select",
        required: true,
        dependsOn: "category",
      }
    ],
  },

  /* ================= JOB TITLE ================= */
  {
    key: "jobTitle",
    label: "Job Title",
   service: (page, limit, search = "") => masterJobTitleService(page, limit, search),
    addService: jobTitleCrud.create,
    updateService: jobTitleCrud.update,
    deleteService: jobTitleCrud.remove,
    listColumns: [
      { key: "name", label: "Title" },
      { key: "categoryNames", label: "Category" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },
      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],
    formFields: [
      { name: "name", label: "Job Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "categoryIds",
        label: "Categories",
        type: "select",
        required: true,
        dependsOn: "category",
      }
    ],
  },

  /* ================= JOB TYPES ================= */
  {
    key: "job_type",
    label: "Job Type",

    service: (page, limit, search = "") => masterJobTypeService(page, limit, search),

    addService: jobTypeCrud.create,
    updateService: jobTypeCrud.update,
    deleteService: jobTypeCrud.remove,

    /* LIST VIEW */
    listColumns: [
      { key: "name", label: "Job Type" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },
      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],

    /* ADD / EDIT FORM */
    formFields: [
      {
        name: "name",
        label: "Job Type Name",
        type: "text",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
      },
    ],
  },

  /* ================= LOCALITY ================= */
  {
    key: "locality",
    label: "Locality",
    service: (page, limit, search = "") => masterLocalityService(page, limit, search),
    addService: localityCrud.create,
    updateService: localityCrud.update,
    deleteService: localityCrud.remove,

    /* ✅ SHOW CITY NAME */
    listColumns: [
      { key: "name", label: "Locality Name" },
      { key: "cityName", label: "City" },
      { key: "code", label: "Code" },
      { key: "pinCode", label: "Pin Code" },
      { key: "status", label: "Status" },
      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],

    /* ✅ CITY DROPDOWN */
    formFields: [
      { name: "name", label: "Locality Name", type: "text", required: true },
      { name: "code", label: "Code", type: "text", required: true },
      { name: "pinCode", label: "Pin Code", type: "text" },
      {
        name: "cityId",
        label: "City",
        type: "select",
        required: true,
        dependsOn: "city",
      },
    ],
  },

  /* ================= ROLES ================= */
  {
    key: "roles",
    label: "Roles",
    service: (page, limit, search = "") => masterRolesService(page, limit, search),
    addService: rolesCrud.create,
    updateService: rolesCrud.update,
    deleteService: rolesCrud.remove,
    listColumns: [
      { key: "roleName", label: "Role Name" },
      { key: "status", label: "Status" },
      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],
    formFields: [
      { name: "roleName", label: "Role Name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  
  /* ================= SALARY TYPE ================= */
  {
    key: "salary_type",
    label: "Salary Type",

    service: (page, limit, search = "") =>
      masterSalaryTypeService(page, limit, search),

    addService: salaryTypeCrud.create,
    updateService: salaryTypeCrud.update,
    deleteService: salaryTypeCrud.remove,

    /* LIST */
    listColumns: [
      { key: "name", label: "Salary Type" },
      { key: "code", label: "Code" },
      { key: "description", label: "Description" },
      { key: "status", label: "Status" },
      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],

    /* ADD / EDIT */
    formFields: [
      {
        name: "name",
        label: "Salary Type Name",
        type: "text",
        required: true,
      },
      {
        name: "code",
        label: "Code",
        type: "text",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
      },
    ],
  },
  /* ================= SKILLS ================= */
  {
    key: "skills",
    label: "Skills",
    service: (page, limit, search = "") => masterJobSKillsService(page, limit, search),
    addService: skillsCrud.create,
    updateService: skillsCrud.update,
    deleteService: skillsCrud.remove,
    listColumns: [
      { key: "name", label: "Skill" },
      { key: "categoryNames", label: "Category" },
      { key: "status", label: "Status" },
      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],
    formFields: [
      { name: "name", label: "Skill Name", type: "text", required: true },
      {
        name: "categoryIds",
        label: "Categories",
        type: "select",
        required: true,
        dependsOn: "category",
      }

    ],
  },

  /* ================= ADVERTISEMENT CREDIT MAPPING ================= */
  {
    key: "advertisement_credit_mapping",
    label: "Advertisement Credit",

    service: (page, limit, search = "") =>
      advertisementCreditMappingService(page, limit, search),

    addService: adCreditMappingCrud.create,
    updateService: adCreditMappingCrud.update,
    deleteService: adCreditMappingCrud.remove,

    /* LIST VIEW */
    listColumns: [
      { key: "minDays", label: "Min Days" },
      { key: "maxDays", label: "Max Days" },
      { key: "credits", label: "Credits" },
      { key: "status", label: "Status" },

      // ✅ AUDIT FIELDS
      { key: "createdInfo", label: "Created" },
      { key: "updatedInfo", label: "Updated" },
    ],

    /* ADD / EDIT FORM */
    formFields: [
      {
        name: "minDays",
        label: "Minimum Days",
        type: "number",
        required: true,
      },
      {
        name: "maxDays",
        label: "Maximum Days",
        type: "number",
        required: true,
      },
      {
        name: "credits",
        label: "Credits",
        type: "number",
        required: true,
      },
    ],
  },

{
  key: "subscription",
  label: "Subscriptions",

  service: (page, limit, search = "") =>
    masterSubscriptionService(page, limit, search),

  addService: subscriptionCrud.create,
  updateService: subscriptionCrud.update,
  deleteService: subscriptionCrud.remove,

  /* ================= LIST VIEW ================= */
  listColumns: [
    { key: "name", label: "Subscription Name" },
    { key: "price", label: "Final Price (₹)" },
    { key: "originalPrice", label: "Original Price (₹)" },
    { key: "premiumJob", label: "Premium Jobs" },
    { key: "credits", label: "Credits" },
    { key: "resumeView", label: "Resume Views" },
    { key: "durationDays", label: "Duration (Days)" },
    { key: "isRecomend", label: "Recommended" },
    { key: "status", label: "Status" },

    // ✅ AUDIT
    { key: "createdInfo", label: "Created" },
    { key: "updatedInfo", label: "Updated" },
  ],

  /* ================= ADD / EDIT MODAL ================= */
  formFields: [
    {
      name: "name",
      label: "Subscription Name",
      type: "text",
      required: true,
    },
    {
      name: "price",
      label: "Final Price (₹)",
      type: "number",
      required: true,
    },
    {
      name: "originalPrice",
      label: "Original Price (₹)",
      type: "number",
    },
    {
      name: "premiumJob",
      label: "Number of Premium Jobs",
      type: "number",
      required: true,
    },
    {
      name: "credits",
      label: "Credits",
      type: "number",
      required: true,
    },
    {
      name: "resumeView",
      label: "Resume Views",
      type: "number",
      required: true,
    },
    {
      name: "durationDays",
      label: "Duration (Days)",
      type: "number",
      required: true,
    },
    {
      name: "isRecomend",
      label: "Recommended Plan",
      type: "radio",
      required: true,
      options: [
        { label: "Yes", value: 1 },
        { label: "No", value: 0 },
      ],
    },

  ],
}





  
];
