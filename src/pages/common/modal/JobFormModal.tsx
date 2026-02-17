'use client';

import React, { useEffect, useState } from 'react';
import { GoPlus } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Loader from "@/ui/common/loader/Loader";

import {
  masterCategoryService,
  masterJobTitleService,
  masterCityService,
  masterLocalityService,
  masterBenifitsService,
  masterJobSKillsService,
  masterDocumentsService,
  masterAssetsRequiredService,
  masterJobTypeService,
  masterSalaryTypeService,
  masterExperienceService,
  createMasterJobTitle,
  createMasterJobSkill,
  createMasterJobCategory,
  createMasterJobType,
  createMasterJobCity,
  createMasterJobLocality,
  createMasterJobExperince,
  createMasterJobSalaryType,
  createMasterJobBenifits,
  createMasterJobDocuments,
  createMasterJobAssets
} from "@/services/masterData";

import { JobPostService } from "@/services/RecruiterService";
import ServerSearchSelect from '@/components/Common/SearchableSelect';
import MultiSelectWithServerSearch from '@/components/Common/MultiSelectWithServerSearch';
import RichTextEditor from '@/components/Common/RichTextEditors';
import { showAlert } from "@/utils/swalFire";
import { generateJobDescription } from "@/services/jobDescriptionTemplate";
//import { useRouter } from "next/navigation";
import { useUser } from '@/hooks/useSession';
import HourOnlyTimePicker from '../../common/TimePicker/TimePicker';
import { recruiterSearchService } from '@/services/SuperAdminService';
import LoaderInner from '../loader/LoaderInner';
import Swal from 'sweetalert2';

/* ---------------- TYPES ---------------- */

interface FormValues {
  recruiter: SelectOption | null;
  // Basic Information
  jobTitle: SelectOption | null;
  category: SelectOption | null;
  openings: any;
  jobType: any;
  isContractJob: boolean;
  workLocation: string;
  experience: SelectOption | null;
  // Location & Demographics
  city: SelectOption | null;
  locality: SelectOption | null;
  gender: string;
  qualification: string;
  salaryBenefits: any;
  salaryMin: string;
  salaryMax: string;

  // Job Details
  benefits: SelectOption[];
  skills: SelectOption[];
  documents: SelectOption[];
  workingDays: string;
  shift: string;
  minJobTiming: string; // Store as decimal hours (e.g., 10.0 for 10:00 AM)
  maxJobTiming: string; // Store as decimal hours (e.g., 19.0 for 7:00 PM)

  // Interview & Communication
  interviewAddress: string;
  candidateCanCall: boolean;
  communicationWindow: string[];

  // Assets & Deposit
  depositRequired: string;
  assetsRequired: SelectOption[];

  // Description
  description: string | null;
}


interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SelectOption {
  value: number;
  label: string;
}

/* ---------------- TIME HELPERS ---------------- */
const timeToDecimal = (timeStr: string): number => {
  if (!timeStr) return 10;
  if (!timeStr.includes(':')) return parseFloat(timeStr);

  const [time, period] = timeStr.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return +(h + m / 60).toFixed(2);
};

const decimalToTime = (decimal: number) => {
  const h = Math.floor(decimal);
  const m = Math.round((decimal % 1) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
};
  const FormError = ({ error }: { error: any }) => {
    if (!error) return null;
    return <div className="text-danger small mt-1">{error.message}</div>;
  };

const confirmForUnverifiedRecruiter = (): Promise<boolean> => {
  return new Promise((resolve) => {
    Swal.fire({
      icon: "warning",
      title: "Unverified Recruiter",
      text: "The selected recruiter is not verified yet. Do you still want to publish the job?",
      showCancelButton: true,
      confirmButtonText: "Yes, Publish",
      cancelButtonText: "No, Save as Draft",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      resolve(result.isConfirmed);
    });
  });
};



/* ---------------- VALIDATION ---------------- */
// const schema = yup.object({
//   jobTitle: yup.mixed<SelectOption>().nullable().required(),
//   category: yup.mixed<SelectOption>().nullable().required(),
//   jobType: yup.mixed<SelectOption>().nullable().required(),
//   experience: yup.mixed<SelectOption>().nullable(),
//   salaryBenefits: yup.mixed<SelectOption>().nullable().required(),
//   city: yup.mixed<SelectOption>().nullable().required(),
//   locality: yup.mixed<SelectOption>().nullable().required(),

//   openings: yup.number().typeError("Must be a number").min(1).required(),
//   workLocation: yup.string().required(),
//   gender: yup.string().required(),
//   qualification: yup.string().required(),

//   salaryMin: yup.string().required(),
//   salaryMax: yup
//     .string()
//     .required()
//     .test("salary-range", "Min salary cannot exceed max salary", function (value) {
//       const { salaryMin } = this.parent;
//       return Number(salaryMin) <= Number(value);
//     }),

//   benefits: yup.array().of(yup.mixed<SelectOption>()).default([]),
//   skills: yup.array().of(yup.mixed<SelectOption>()).default([]),
//   documents: yup.array().of(yup.mixed<SelectOption>()).default([]),
//   assetsRequired: yup.array().of(yup.mixed<SelectOption>()).default([]),

//   minJobTiming: yup.string().required(),
//   maxJobTiming: yup.string().required(),
//   workingDays: yup.string().required(),
//   shift: yup.string().required(),

//   candidateCanCall: yup.boolean().default(false),
//   depositRequired: yup.string().required(),

//   interviewAddress: yup.string().min(10).required(),
//   description: yup.string().required(),
// });




/* ---------------- COMPONENT ---------------- */
export default function AddJobModal({ open, onClose, onSuccess }: AddJobModalProps) {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [hrNumber, setHrNumber] = useState(user?.user_mobile);
  const [editHr, setEditHr] = useState(false);
  const [suggestedTemplate, setSuggestedTemplate] = useState<string>("");

  const validationSchema = yup.object({
    recruiter: yup
  .object({
    value: yup.number().required(),
    label: yup.string().required(),
  })
  .nullable()
  .required("Recruiter is required"),

    // Basic Information
    jobTitle: yup
      .object({
        value: yup.number().required('Job Title is required'),
        label: yup.string().required()
      })
      .nullable()
      .required('Job Title is required'),

    category: yup
      .object({
        value: yup.number().required('Job Category is required'),
        label: yup.string().required()
      })
      .nullable()
      .required('Job Category is required'),

    openings: yup
      .string()
      .required('Number of Openings is required')
      .test('is-number', 'Must be a valid number', (value) => !isNaN(parseInt(value)))
      .test('min-value', 'Openings must be at least 1', (value) => {
        const num = parseInt(value);
        return !isNaN(num) && num >= 1;
      }),

    jobType: yup
  .object({
    value: yup.number().required('Job type is required'),
    label: yup.string().required(),
  })
  .nullable()
  .required('Job type is required'),


    isContractJob: yup.boolean().default(false),
    workLocation: yup.string().required('Work location is required'),
    experience: yup.object().nullable(),

    // Location & Demographics
    city: yup
      .object({
        value: yup.number().required('City is required'),
        label: yup.string().required()
      })
      .nullable()
      .required('City is required'),

    locality: yup
      .object({
        value: yup.number().required('Locality is required'),
        label: yup.string().required()
      })
      .nullable()
      .required('Locality is required'),

    gender: yup.string().required('Gender is required'),
    qualification: yup.string().required('Qualification is required'),
    salaryBenefits: yup.object().nullable().required('Salary benefits is required'),

    salaryMin: yup
      .string()
      .required('Minimum salary is required')
      .test('is-number', 'Must be a valid number', (value) => !isNaN(parseFloat(value)))
      .test('min-value', 'Salary must be positive', (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
      }),

    salaryMax: yup
      .string()
      .required('Maximum salary is required')
      .test('is-number', 'Must be a valid number', (value) => !isNaN(parseFloat(value)))
      .test('min-value', 'Salary must be positive', (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
      })
      .test('salary-range', 'Minimum salary cannot be greater than maximum salary', function (value) {
        const { salaryMin } = this.parent;
        if (!salaryMin || !value) return true;

        const minSalary = parseFloat(salaryMin);
        const maxSalary = parseFloat(value);

        if (isNaN(minSalary) || isNaN(maxSalary)) return true;
        return minSalary <= maxSalary;
      }),

    // Job Details
    benefits: yup.array().of(
      yup.object({
        value: yup.number().required(),
        label: yup.string().required()
      })
    ).default([]),

    skills: yup.array().of(
      yup.object({
        value: yup.number().required(),
        label: yup.string().required()
      })
    ).default([]),

    documents: yup.array().of(
      yup.object({
        value: yup.number().required(),
        label: yup.string().required()
      })
    ).default([]),

    workingDays: yup.string().required('Working days is required'),
    shift: yup.string().required('Shift is required'),

    minJobTiming: yup
      .string()
      .required('Start time is required')
      .test('is-valid-time', 'Please enter a valid time', (value) => {
        if (!value) return false;
        const decimal = timeToDecimal(value);
        return !isNaN(decimal) && decimal >= 0 && decimal <= 24;
      }),

    maxJobTiming: yup
      .string()
      .required('End time is required')
      .test('is-valid-time', 'Please enter a valid time', (value) => {
        if (!value) return false;
        const decimal = timeToDecimal(value);
        return !isNaN(decimal) && decimal >= 0 && decimal <= 24;
      })
      .test('timing-range', 'Start time must be less than end time', function (value) {
        const { minJobTiming } = this.parent;
        if (!minJobTiming || !value) return true;

        const startTime = timeToDecimal(minJobTiming);
        const endTime = timeToDecimal(value);

        if (isNaN(startTime) || isNaN(endTime)) return true;
        return startTime < endTime;
      }),

    // Interview & Communication
    interviewAddress: yup
      .string()
      .required('Interview address is required')
      .min(10, 'Address must be at least 10 characters'),

    candidateCanCall: yup.boolean().default(false),
    communicationWindow: yup.array().of(yup.string()).default([]),

    // Assets & Deposit
    depositRequired: yup.string().required('Deposit information is required'),
    assetsRequired: yup.array().of(
      yup.object({
        value: yup.number().required(),
        label: yup.string().required()
      })
    ).default([]),

    // Description
    description: yup
      .string()
      .nullable()
      .required('Job description is required')
      .test('not-empty', 'Job description is required', (value: any) => {
        return value && value.trim().length > 0;
      }),
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
    recruiter: null,
      jobTitle: null,
      category: null,
      salaryBenefits: null,
      openings: 1,
      jobType: null,
      experience: null,
      isContractJob: false,
      workLocation: 'Work from office',
      city: null,
      locality: null,
      gender: 'Any',
      qualification: 'Any',
      minJobTiming: "10.0", // Store as decimal
      maxJobTiming: "19.0", // Store as decimal
      salaryMin: "5000",
      salaryMax: "10000",
      benefits: [],
      skills: [],
      documents: [],
      workingDays: '5 days working',
      shift: 'Day',
      interviewAddress: user?.user_locality || '',
      candidateCanCall: false,
      communicationWindow: [],
      depositRequired: 'No',
      assetsRequired: [],
      description: null,
    },
    mode: 'onBlur',
  });


  const candidateCanCall = useWatch({
    control,
    name: "candidateCanCall",
  });
  
  const selectedCity = useWatch({
    control,
    name: "city",
  });

  const selectedCategory = useWatch({
    control,
    name: "category",
  });


  useEffect(() => {
    if (selectedCity?.value) {
      setValue("locality", null);
    }
  }, [selectedCity?.value]);

  useEffect(() => {
  if (selectedCategory?.value) {
    setValue("jobTitle", null);
    setValue("skills", []);
    setValue("benefits", []);
  }
}, [selectedCategory?.value]);



  if (!open) return null;

//   useEffect(() => {
//   if (open) {
//     document.body.style.overflow = 'hidden';
//   } else {
//     document.body.style.overflow = '';
//   }

//   return () => {
//     document.body.style.overflow = '';
//   };
// }, [open]);


  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data: FormValues) => {
     //setLoading(true);
 
     try {
       // Format qualification according to database enum
       const formatQualification = (qual: string): string => {
         const map: Record<string, string> = {
           'Any': 'Any',
           '10th Pass': 'highschool',
           '12th Pass': 'intermediate',
           'Diploma': 'diploma',
           'Graduate': 'graduate',
           'Post Graduate': 'postgraduate'
         };
         return map[qual] || 'highschool';
       };
 
       // Format work location
       const formatWorkLocation = (location: string): string => {
         const map: Record<string, string> = {
           'Work from office': 'Office',
           'Field job': 'Field',
           'Work from home': 'WorkFromHome'
         };
         return map[location] || 'Office';
       };
 
       // Format working days
       const formatWorkingDays = (days: string): string => {
         const map: Record<string, string> = {
           '5 days working': '5',
           '6 days working': '6',
           'other': 'other'
         };
         return map[days] || '5';
       };
 
       // Convert time strings to decimal hours for backend
       const minJobTimingDecimal = timeToDecimal(data.minJobTiming);
       const maxJobTimingDecimal = timeToDecimal(data.maxJobTiming);

      const recruiter: any = data.recruiter;
      const isRecruiterVerified = recruiter?.user_isVerified === true || recruiter?.status === 'VERIFIED';
      let jobStatus: "PUBLISHED" | "DRAFT" = "PUBLISHED";

      if (!isRecruiterVerified) {
        const publishAnyway = await confirmForUnverifiedRecruiter();
        if (!publishAnyway) {
          jobStatus = "DRAFT";
        }
      }
 
       const formData = {
         // Required fields from database
         recruiterId: data.recruiter?.value,
         titleId: data.jobTitle?.value,
         categoryId: data.category?.value,
         cityId: data.city?.value,
         localityId: data.locality?.value,
         jobTypeId: data.jobType?.value,
         experinceId: data.experience?.value || null,
 
         // Other required fields with defaults
         hiringForOthers: 0,
         openings: parseInt(data.openings),
         agencyId: null,
 
         // Job type and location
         workLocation: formatWorkLocation(data.workLocation),
 
         // Demographics
         gender: data.gender,
         qualification: formatQualification(data.qualification),
 
         // Salary (converted to decimal)
         salaryBenefits: data.salaryBenefits?.value || data.salaryBenefits,
         salaryMin: parseFloat(data.salaryMin),
         salaryMax: parseFloat(data.salaryMax),
 
         // Working days and shift
         workingDays: formatWorkingDays(data.workingDays),
         shift: data.shift,
 
         // Job timings (converted to decimal)
         minJobTiming: minJobTimingDecimal,
         maxJobTiming: maxJobTimingDecimal,
 
         // Deposit and verification
         depositRequired: data.depositRequired === 'Yes' ? 1 : 0,
         verificationRequired: 0,
 
         // Interview and communication
         interviewAddress: data.interviewAddress,
         communicationWindow: [],
         candidateCanCall: data.candidateCanCall ? 1 : 0,
         hr_contact: hrNumber,
         // Job posting type
         jobPostingFor: 'INDIVIDUAL',
 
         // Description and status
         description: data.description,
         status: jobStatus,
         adminComments: null,
 
         // Audit fields
         createdBy: user?.user_id || 1,
         updatedBy: user?.user_id || 1,
 
         // Arrays for related tables
         jobSkillsIds: data.skills.map(skill => skill.value),
         assetsIds: data.assetsRequired.map(asset => asset.value),
         documentsIds: data.documents.map(doc => doc.value),
         jobBenefitsIds: data.benefits.map(benefit => benefit.value)
       };
       console.log('Submitting form data:', formData);
 
       // Uncomment to actually submit
       const response = await JobPostService(formData);
       if (response.code>=400) {
         showAlert("error", response?.message || "Something went wrong", "Failed");
         return;
       }
       if (!response?.success) {
         showAlert("error", response?.message || "Something went wrong", "Failed");
         return;
       }
 
       //showAlert("success", response?.message || "Job posted successfully", "Success");
       showAlert("success",jobStatus === "PUBLISHED" ? "Job published successfully" : "Job saved as draft","Success");

       onClose();

        // Optional: refresh parent list
        onSuccess?.();

        // Reset form AFTER close
        reset();
       //router.replace("/recruiter/job/list");
 
     } catch (error) {
       console.error('Error submitting form:', error);
       showAlert("error", "An error occurred while posting the job", "Error");
     } finally {
       setLoading(false);
     }
   };

  return (
    <>
      {loading && <LoaderInner />}

      <div className="modal fade show d-block">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">

            <div className="modal-header">
              <h5>Add Job</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <form
            onSubmit={handleSubmit(
                onSubmit,
                (errors) => {
                console.log("❌ FORM ERRORS", errors);
                }
            )}
>

              <div className="modal-body">
                <div className="row g-3">

                   {/* Job Basic Information */}
                <div className='row'>
                    <div className="col-md-4">
                        <div className="mb-3">
                            <label className="form-label">
                            Recruiter <span className="redastric">*</span>
                            </label>

                            <Controller
                            name="recruiter"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                <ServerSearchSelect
                                    placeholder="Search Recruiter"
                                    value={field.value}
                                    onChange={field.onChange}
                                    isMulti={false}
                                    fetchOptions={(input: string, config: any) =>
                                    recruiterSearchService(input, config)
                                    }
                                    getOptionLabel={(item: any) => item.user_fullName || item.name}
                                    getOptionValue={(item: any) => item.user_id}
                                />

                                {fieldState.error && (
                                    <div className="text-danger small mt-1">
                                    {fieldState.error.message}
                                    </div>
                                )}
                                </>
                            )}
                            />
                        </div>
                    </div>

                    <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="category" className="form-label">Job Category<span className='redastric'>*</span></label>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <ServerSearchSelect
                            placeholder="Search Job Category"
                            value={field.value}
                            onChange={field.onChange}
                            isMulti={false}
                            isCreatable={false}
                            fetchOptions={(input: string, config: any) =>
                              masterCategoryService(input, config)
                            }
                            // onCreateOption={async (inputValue) => {
                            //   const payload = {
                            //     name: inputValue,
                            //     description: "",
                            //     status: 1,
                            //     createdBy: 101
                            //   };
                            //   return await createMasterJobCategory(payload);
                            // }}
                            getOptionLabel={(item) => item.name}
                            getOptionValue={(item) => item.id}
                          />
                        )}
                      />
                      <FormError error={errors.category} />
                    </div>
                  </div>

                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="jobTitle" className="form-label">Job Title<span className='redastric'>*</span></label>
                      <Controller
                        name="jobTitle"
                        control={control}
                        render={({ field, fieldState }) => (
                          <ServerSearchSelect
                            key={selectedCategory?.value || "no-category"} // 🔥 force re-render
                            placeholder={
                              selectedCategory
                                ? "Search Job Title"
                                : "Select category first"
                            }
                            value={field.value}
                            onChange={field.onChange}
                            isMulti={false}
                            isCreatable={true}
                            isDisabled={!selectedCategory}
                            fetchOptions={(input: string, config: any) =>
                              masterJobTitleService(input, {
                                ...config,
                                categoryId: selectedCategory?.value,
                              })
                            }
                            onCreateOption={async (inputValue) => {
                              if (!selectedCategory?.value) {
                                showAlert("error", "Please select a job category first", "Category Required");
                                return null;
                              }
                              const payload = {
                                name: inputValue,
                                description: "",
                                categoryIds: [selectedCategory?.value],
                                status: 1,
                                createdBy: user.user_id,
                              };
                              return await createMasterJobTitle(payload);
                            }}
                            getOptionLabel={(item) => item.name}
                            getOptionValue={(item) => item.id}
                          />
                        )}
                      />

                    </div>
                  </div>

                  
                </div>

                {/* Job Type & Location */}
                <div className='row'>
                    <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="openings" className="form-label">Number of Openings<span className='redastric'>*</span></label>
                      <Controller
                        name="openings"
                        control={control}
                        render={({ field }) => (
                          <input
                            id="openings"
                            type="number"
                            className={`form-control ${errors.openings ? ' ' : ''}`}
                            placeholder="e.g. 1"
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Ensure non-negative
                              if (parseInt(value) < 1 && value !== '') return;
                              field.onChange(value);
                            }}
                            onBlur={field.onBlur}
                            min="1"
                          />
                        )}
                      />
                      <FormError error={errors.openings} />
                    </div>
                  </div>
                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="jobType" className="form-label">Job Type<span className='redastric'>*</span></label>
                      <Controller
                        name="jobType"
                        control={control}
                        render={({ field }) => (
                          <ServerSearchSelect
                            placeholder="Search Job Type"
                            value={field.value}
                            onChange={field.onChange}
                            isMulti={false}
                            isCreatable={false}
                            fetchOptions={(input: string, config: any) =>
                              masterJobTypeService(input, config)
                            }
                            // onCreateOption={async (inputValue) => {
                            //   const payload = {
                            //     name: inputValue,
                            //     description: "",
                            //     status: 1,
                            //     createdBy: 101
                            //   };
                            //   return await createMasterJobType(payload);
                            // }}
                            getOptionLabel={(item) => item.name}
                            getOptionValue={(item) => item.id}
                          />
                        )}
                      />
                      <FormError error={errors.jobType} />
                    </div>
                  </div>

                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label className="form-label">Work Location Type<span className='redastric'>*</span></label>
                      <div className="d-grid gap-2 d-md-flex roundbtn">
                        <Controller
                          name="workLocation"
                          control={control}
                          render={({ field }) => (
                            <>
                              <button
                                className={`btn btn-sm ${field.value === 'Work from office' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Work from office')}
                              >
                                Work from office
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === 'Field job' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Field job')}
                              >
                                Field job
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === 'Work from home' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Work from home')}
                              >
                                Work from home
                              </button>
                            </>
                          )}
                        />
                      </div>
                      <FormError error={errors.workLocation} />
                    </div>
                  </div>

                  
                </div>

                {/* Location & Demographics */}
                <div className='row'>
                    <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="city" className="form-label">Choose City<span className='redastric'>*</span></label>
                      <Controller
                        name="city"
                        control={control}
                        render={({ field }) => (
                          <ServerSearchSelect
                            placeholder="Search City"
                            value={field.value}
                            onChange={field.onChange}
                            isMulti={false}
                            isCreatable={false}
                            fetchOptions={(input: string, config: any) =>
                              masterCityService(input, config)
                            }
                            // onCreateOption={async (inputValue) => {
                            //   const payload = {
                            //     name: inputValue,
                            //     description: "",
                            //     status: 1,
                            //     createdBy: 101
                            //   };
                            //   return await createMasterJobCity(payload);
                            // }}
                            getOptionLabel={(item) => item.name}
                            getOptionValue={(item) => item.id}
                          />
                        )}
                      />
                      <FormError error={errors.city} />
                    </div>
                  </div>
                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="locality" className="form-label">Job Locality<span className='redastric'>*</span></label>
                      <Controller
                        name="locality"
                        control={control}
                        render={({ field }) => (
                          <ServerSearchSelect
                            key={selectedCity?.value || "no-city"}   // 🔥 THIS is the fix
                            placeholder={
                              selectedCity
                                ? "Search Locality"
                                : "Select city first"
                            }
                            value={field.value}
                            onChange={field.onChange}
                            isMulti={false}
                            isCreatable={true}
                            isDisabled={!selectedCity}
                            fetchOptions={(input: string, config: any) =>
                              masterLocalityService(input, {
                                ...config,
                                cityId: selectedCity?.value,
                              })
                            }
                            onCreateOption={async (inputValue) => {
                              const payload = {
                                name: inputValue,
                                cityId: selectedCity?.value,
                                status: 1,
                                createdBy: user.user_id
                              };
                              return await createMasterJobLocality(payload);
                            }}
                            getOptionLabel={(item) => item.name}
                            getOptionValue={(item) => item.id}
                          />
                        )}
                      />
                      <FormError error={errors.locality} />
                    </div>
                  </div>

                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label className="form-label">Gender<span className='redastric'>*</span></label>
                      <div className="d-grid gap-2 d-md-flex roundbtn">
                        <Controller
                          name="gender"
                          control={control}
                          render={({ field }) => (
                            <>
                              <button
                                className={`btn btn-sm ${field.value === 'Any' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Any')}
                              >
                                Any
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === 'Male' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Male')}
                              >
                                Male
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === 'Female' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Female')}
                              >
                                Female
                              </button>
                            </>
                          )}
                        />
                      </div>
                      <FormError error={errors.gender} />
                    </div>
                  </div>

                  <div className='col-md-12'>
                    <div className="mb-3">
                      <label className="form-label">Minimum Qualification Required<span className='redastric'>*</span></label>
                      <div className="d-grid gap-2 d-md-flex roundbtn">
                        <Controller
                          name="qualification"
                          control={control}
                          render={({ field }) => (
                            <>
                              <button
                                className={`btn btn-sm ${field.value === 'Any' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Any')}
                              >
                                Any
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === '10th Pass' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('10th Pass')}
                              >
                                10th Pass
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === '12th Pass' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('12th Pass')}
                              >
                                12th Pass
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === 'Diploma' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Diploma')}
                              >
                                Diploma
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === 'Graduate' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Graduate')}
                              >
                                Graduate
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === 'Post Graduate' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Post Graduate')}
                              >
                                Post Graduate
                              </button>
                            </>
                          )}
                        />
                      </div>
                      <FormError error={errors.qualification} />
                    </div>
                  </div>
                </div>

                {/* Experience & Salary */}
                <div className='row'>

                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="experience" className="form-label">Experience Range</label>
                      <Controller
                        name="experience"
                        control={control}
                        render={({ field }) => (
                          <ServerSearchSelect
                            placeholder="Search Experience or Create New"
                            value={field.value}
                            onChange={field.onChange}
                            isMulti={false}
                            isCreatable={true}
                            fetchOptions={(input: string, config: any) =>
                              masterExperienceService(input, config)
                            }
                            onCreateOption={async (inputValue) => {
                              const payload = {
                                name: inputValue,
                                description: "",
                                status: 1,
                                createdBy: user.user_id
                              };
                              return await createMasterJobExperince(payload);
                            }}
                            getOptionLabel={(item) => item.name}
                            getOptionValue={(item) => item.id}
                          />
                        )}
                      />
                      <FormError error={errors.experience} />
                    </div>
                  </div>

                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="salaryBenefits" className="form-label">Salary & benefits<span className='redastric'>*</span></label>
                      <Controller
                        name="salaryBenefits"
                        control={control}
                        render={({ field }) => (
                          <ServerSearchSelect
                            placeholder="Search Salary & benefits or Create New"
                            value={field.value}
                            onChange={field.onChange}
                            isMulti={false}
                            isCreatable={true}
                            fetchOptions={(input: string, config: any) =>
                              masterSalaryTypeService(input, config)
                            }
                            onCreateOption={async (inputValue) => {
                              const payload = {
                                name: inputValue,
                                description: "",
                                status: 1,
                                createdBy: user.user_id
                              };
                              return await createMasterJobSalaryType(payload);
                            }}
                            getOptionLabel={(item) => item.name}
                            getOptionValue={(item) => item.id}
                          />
                        )}
                      />
                      <FormError error={errors.salaryBenefits} />
                    </div>
                  </div>

                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label className="form-label">Salary details/ monthly<span className='redastric'>*</span></label>
                      <div className="mutipleSelctBox">
                        <Controller
                          name="salaryMin"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="number"
                              className={`form-control ${errors.salaryMin ? ' ' : ''}`}
                              placeholder="Min (₹)"
                              value={field.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Ensure non-negative
                                if (parseFloat(value) < 0 && value !== '') return;
                                field.onChange(value);
                              }}
                              onBlur={field.onBlur}
                              min="0"
                              step="100"
                            />
                          )}
                        />
                        <span className='toSeprate'>To</span>
                        <Controller
                          name="salaryMax"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="number"
                              className={`form-control ${errors.salaryMax ? ' ' : ''}`}
                              placeholder="Max (₹)"
                              value={field.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Ensure non-negative
                                if (parseFloat(value) < 0 && value !== '') return;
                                field.onChange(value);
                              }}
                              onBlur={field.onBlur}
                              min="0"
                              step="100"
                            />
                          )}
                        />
                      </div>
                      <FormError error={errors.salaryMin} />
                      <FormError error={errors.salaryMax} />
                      {errors.salaryMax?.type === 'salary-range' && (
                        <div className="text-danger small">Minimum salary cannot be greater than maximum salary</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills & Benefits */}
                <div className='row'>
                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="benefits" className="form-label">Job Benefits (optional)</label>
                      <Controller
                        name="benefits"
                        control={control}
                        render={({ field }) => (
                          <MultiSelectWithServerSearch
                            key={selectedCategory?.value || "no-category"}
                            placeholder={
                              selectedCategory
                                ? "Search Benefits"
                                : "Select category first"
                            }
                            value={field.value}
                            onChange={field.onChange}
                            fetchOptions={(input: any, config: any) =>
                              masterBenifitsService(input, {
                                ...config,
                                categoryId: selectedCategory?.value,
                              })
                            }
                            isMulti
                            isCreatable
                            isDisabled={!selectedCategory}
                            onCreateOption={async (inputValue) => {
                              const payload = {
                                name: inputValue,
                                categoryIds: [selectedCategory?.value],
                                status: 1,
                                createdBy: user.user_id,
                              };
                              return await createMasterJobBenifits(payload);
                            }}
                            getOptionLabel={(item) => item.name}
                            getOptionValue={(item) => item.id}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="skills" className="form-label">Job Skills (optional)</label>
                      <Controller
                        name="skills"
                        control={control}
                        render={({ field }) => (
                          <MultiSelectWithServerSearch
                            key={selectedCategory?.value || "no-category"}
                            placeholder={
                              selectedCategory
                                ? "Search Skills"
                                : "Select category first"
                            }
                            value={field.value}
                            onChange={field.onChange}
                            fetchOptions={(input: any, config: any) =>
                              masterJobSKillsService(input, {
                                ...config,
                                categoryId: selectedCategory?.value,
                              })
                            }
                            isMulti
                            isCreatable
                            isDisabled={!selectedCategory}
                            onCreateOption={async (inputValue) => {
                              const payload = {
                                name: inputValue,
                                categoryIds: [selectedCategory?.value],
                                status: 1,
                                createdBy: user.user_id,
                              };
                              return await createMasterJobSkill(payload);
                            }}
                            getOptionLabel={(item) => item.name}
                            getOptionValue={(item) => item.id}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="documents" className="form-label">Documents Required (optional)</label>
                      <Controller
                        name="documents"
                        control={control}
                        render={({ field }) => (

                          <MultiSelectWithServerSearch
                            id="documents"
                            placeholder="Search Documents"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            fetchOptions={(input: any, config: any) =>
                              masterDocumentsService(input, config)
                            }
                            isMulti
                            isCreatable={false}
                            // onCreateOption={async (inputValue) => {
                            //   const payload = {
                            //     name: inputValue,
                            //     description: "",
                            //     status: 1,
                            //     createdBy: user.user_id
                            //   };
                            //   const response = await createMasterJobDocuments(payload);
                            //   return response?.data || response;
                            // }}
                            getOptionLabel={(item) => item.name || item.label}
                            getOptionValue={(item) => item.id || item.value}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Timings & Working Days */}
                <div className='row'>
                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label className="form-label">Job Timings<span className='redastric'>*</span></label>
                      <div className="d-flex align-items-center gap-2">
                        <Controller
                          name="minJobTiming"
                          control={control}
                          render={({ field }) => (
                            <div className='customTimePick' style={{ flex: 1 }}>
                              <HourOnlyTimePicker
                                value={decimalToTime(parseFloat(field.value))}
                                onChange={(timeString) => {
                                  const decimal = timeToDecimal(timeString);
                                  field.onChange(decimal.toString());
                                }}
                              />
                            </div>
                          )}
                        />
                        <span className='toSeprate'>To</span>
                        <Controller
                          name="maxJobTiming"
                          control={control}
                          render={({ field }) => (
                            <div className='customTimePick' style={{ flex: 1 }}>
                              <HourOnlyTimePicker
                                value={decimalToTime(parseFloat(field.value))}
                                onChange={(timeString) => {
                                  const decimal = timeToDecimal(timeString);
                                  field.onChange(decimal.toString());
                                }}
                              />
                            </div>
                          )}
                        />
                      </div>
                      <div className="mt-1">
                        <FormError error={errors.minJobTiming} />
                        <FormError error={errors.maxJobTiming} />
                        {errors.maxJobTiming?.type === 'timing-range' && (
                          <div className="text-danger small">Start time must be less than end time</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label className="form-label">Working Days<span className='redastric'>*</span></label>
                      <div className="d-grid gap-2 d-md-flex roundbtn">
                        <Controller
                          name="workingDays"
                          control={control}
                          render={({ field }) => (
                            <>
                              <button
                                className={`btn btn-sm ${field.value === '5 days working' ? 'btn-primary active' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('5 days working')}
                              >
                                5 days working <IoCheckmark />
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === '6 days working' ? 'btn-primary active' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('6 days working')}
                              >
                                6 days working <GoPlus />
                              </button>
                            </>
                          )}
                        />
                      </div>
                      <FormError error={errors.workingDays} />
                    </div>
                  </div>

                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label className="form-label">Shift<span className='redastric'>*</span></label>
                      <div className="d-grid gap-2 d-md-flex roundbtn">
                        <Controller
                          name="shift"
                          control={control}
                          render={({ field }) => (
                            <>
                              <button
                                className={`btn btn-sm ${field.value === 'Day' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Day')}
                              >
                                Day
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === 'Night' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Night')}
                              >
                                Night
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === 'Any' ? 'btn-primary selected' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Any')}
                              >
                                Any
                              </button>
                            </>
                          )}
                        />
                      </div>
                      <FormError error={errors.shift} />
                    </div>
                  </div>
                </div>

                {/* Interview Details */}
                <div className='row'>
                  <div className='col-md-12'>
                    <div className="mb-3">
                      <label htmlFor="interviewAddress" className="form-label">Full Interview Address<span className='redastric'>*</span></label>
                      <Controller
                        name="interviewAddress"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            id="interviewAddress"
                            className={`form-control ${errors.interviewAddress ? ' ' : ''}`}
                            placeholder="Enter complete interview address"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            rows={3}
                          />
                        )}
                      />
                      <FormError error={errors.interviewAddress} />
                    </div>
                  </div>
                </div>

                {/* Communication Preferences */}
                <div className='row'>
                  <div className='col-md-12'>
                    <div className="mb-3 form-check">
                      <Controller
                        name="candidateCanCall"
                        control={control}
                        render={({ field }) => (
                          <input
                            id="candidateCanCall"
                            className="form-check-input"
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <label htmlFor="candidateCanCall" className="form-check-label">
                        Allow candidates to call between 10:00 am - 07:00 pm on {hrNumber}
                        {editHr && (
                          <input
                            className="form-control"
                            type="tel"
                            value={hrNumber}
                            maxLength={10}
                            pattern="[0-9]{10}"
                            onChange={(e) => setHrNumber(e.target.value.replace(/\D/g, ""))}
                            placeholder="Enter 10 digit number"
                          />
                        )}

                        <span
                          className="blueedit cursor-pointer"
                          onClick={() => {
                            if (editHr) {
                              // SAVE
                              if (hrNumber?.length !== 10) {
                                showAlert("error", "Please enter a valid 10 digit number", "Invalid");
                                return;
                              }
                              setEditHr(false);
                            } else {
                              // EDIT
                              setEditHr(true);
                            }
                          }}
                        >
                          {editHr ? "Save" : "(Edit)"}
                        </span>

                      </label>

                    </div>
                  </div>
                </div>

                {/* Deposit & Assets */}
                <div className='row'>
                  <div className='col-md-12'>
                    <div className="mb-3">
                      <label className="form-label">
                        Is candidate required to make any deposit (e.g. uniform charges, delivery bag, etc)?
                        <span className='redastric'>*</span>
                      </label>
                      <div className="d-grid gap-2 d-md-flex roundbtn">
                        <Controller
                          name="depositRequired"
                          control={control}
                          render={({ field }) => (
                            <>
                              <button
                                className={`btn btn-sm ${field.value === 'Yes' ? 'btn-primary active' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('Yes')}
                              >
                                Yes
                              </button>
                              <button
                                className={`btn btn-sm ${field.value === 'No' ? 'btn-primary active' : 'btn-outline-primary'}`}
                                type="button"
                                onClick={() => field.onChange('No')}
                              >
                                No
                              </button>
                            </>
                          )}
                        />
                      </div>
                      <FormError error={errors.depositRequired} />
                    </div>
                  </div>
                </div>

                <div className='row'>
                  <div className='col-md-4'>
                    <div className="mb-3">
                      <label htmlFor="assetsRequired" className="form-label">Assets Required (optional)</label>
                      <Controller
                        name="assetsRequired"
                        control={control}
                        render={({ field }) => (
                          <MultiSelectWithServerSearch
                            id="assetsRequired"
                            placeholder="Search Assets or Create New"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            fetchOptions={(input: any, config: any) =>
                              masterAssetsRequiredService(input, config)
                            }
                            isMulti
                            isCreatable={true}
                            onCreateOption={async (inputValue) => {
                              const payload = {
                                name: inputValue,
                                description: "",
                                status: 1,
                                createdBy: 101
                              };
                              const response = await createMasterJobAssets(payload);
                              return response?.data || response;
                            }}
                            getOptionLabel={(item) => item.name || item.label}
                            getOptionValue={(item) => item.id || item.value}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Generate Suggested Template */}
                <div className="mb-3 text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      const values = getValues();
                      // Convert decimal times back to display format for template
                      const valuesForTemplate = {
                        ...values,
                        minJobTiming: decimalToTime(parseFloat(values.minJobTiming)),
                        maxJobTiming: decimalToTime(parseFloat(values.maxJobTiming))
                      };
                      const template = generateJobDescription(valuesForTemplate);
                      setSuggestedTemplate(template);
                    }}
                  >
                    Generate Suggested Template
                  </button>
                </div>

                {/* Suggested Template textarea */}
                {suggestedTemplate && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label mb-0">Suggested Template</label>

                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setValue("description", suggestedTemplate, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          setSuggestedTemplate("");
                        }}
                      >
                        Apply
                      </button>
                    </div>

                    <div
                      className="form-control"
                      style={{
                        minHeight: "220px",
                        overflowY: "auto",
                        backgroundColor: "#f8f9fa",
                      }}
                      dangerouslySetInnerHTML={{ __html: suggestedTemplate }}
                    />
                  </div>
                )}
                {/* Job Description */}
                <div className="row">
                  <div className="col-md-12 mb-5">
                    <label htmlFor="description" className="form-label">Job Description<span className='redastric'>*</span></label>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <RichTextEditor
                          id="description"
                          description={field.value}
                          setDescription={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                    <FormError error={errors.description} />
                  </div>
                </div>

                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || isSubmitting}
                    >
                    {loading ? "Submitting..." : "Create Job"}
                    </button>

              </div>
            </form>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}
