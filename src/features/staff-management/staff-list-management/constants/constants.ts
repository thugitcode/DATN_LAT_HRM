export const genderOptions = [
  { label: 'Nam', key: 'MALE' },
  { label: 'Nữ', key: 'FEMALE' },
  { label: 'Khác', key: 'OTHER' },
];

export const workTypeOptions = [
  { label: 'Toàn thời gian', key: 'FULL_TIME' },
  { label: 'Bán thời gian', key: 'PART_TIME' },
];

// export const jobTitleOptions = [
//   { label: 'Bác sĩ', key: 'DOCTOR' },
//   { label: 'Điều dưỡng', key: 'NURSE' },
//   { label: 'Kỹ thuật viên', key: 'TECHNICIAN' },
//   { label: 'Hộ sinh', key: 'MIDWIFE' },
//   { label: 'Y sĩ', key: 'PHYSICIAN_ASSISTANT' },
//   { label: 'Nhân viên văn phòng', key: 'OFFICE_STAFF' },
// ];

export const positionOptions = [
  { label: 'Nhân viên', key: 'STAFF' },
  { label: 'Trưởng khoa', key: 'HEAD_OF_DEPARTMENT' },
  { label: 'Phó khoa', key: 'DEPUTY_HEAD_OF_DEPARTMENT' },
  { label: 'Điều dưỡng trưởng', key: 'CHIEF_NURSE' },
  { label: 'Trưởng phòng', key: 'MANAGER' },
  { label: 'Trưởng bộ phận', key: 'HEAD_OF_UNIT' },
  { label: 'Phó phòng', key: 'DEPUTY_MANAGER' },
];

export const contractTypeOptions = [
  { label: 'Nhân viên chính thức', key: 'FULL_TIME' },
  { label: 'Nhân viên thử việc', key: 'PROBATION' },
  { label: 'Nhân viên học việc', key: 'INTERNSHIP' },
  { label: 'Chuyên gia hợp tác', key: 'EXPERT_COOPERATION' },
];

export const qualificationOptions = [
  { label: 'Trung cấp', key: 'INTERMEDIATE' },
  { label: 'Cao đẳng', key: 'COLLEGE' },
  { label: 'Đại học', key: 'BACHELOR' },
  { label: 'Thạc sĩ', key: 'MASTER' },
  { label: 'Bác sĩ', key: 'DOCTOR' },
  { label: 'Tiến sĩ', key: 'PHD' },
  { label: 'Bác sĩ chuyên khoa', key: 'SPECIALIST_DOCTOR' },
  { label: 'Khác', key: 'OTHER' },
];

// { key: 'ALL', label: t('job_title.ALL') }, // Tất cả chức danh
export const jobTitleOptions = (t: any) => [
  { key: 'DOCTOR', label: t('job_title.DOCTOR') }, // Bác sĩ
  { key: 'NURSE', label: t('job_title.NURSE') }, // Điều dưỡng
  { key: 'TECHNICIAN', label: t('job_title.TECHNICIAN') }, // Kỹ thuật viên (general – keep or remove if splitting)
  { key: 'MIDWIFE', label: t('job_title.MIDWIFE') }, // Hộ sinh
  { key: 'PHYSICIAN_ASSISTANT', label: t('job_title.PHYSICIAN_ASSISTANT') }, // Y sĩ
  { key: 'OFFICE_STAFF', label: t('job_title.OFFICE_STAFF') }, // Nhân viên văn phòng
  { key: 'MANAGEMENT', label: t('job_title.MANAGEMENT') }, // Quản trị
  { key: 'LAB_TECHNICIAN', label: t('job_title.LAB_TECHNICIAN') }, // Kỹ thuật viên xét nghiệm
  { key: 'IMAGING_TECHNICIAN', label: t('job_title.IMAGING_TECHNICIAN') }, // Kỹ thuật viên CĐHA
  { key: 'CASHIER', label: t('job_title.CASHIER') }, // Thu ngân
  { key: 'RECEPTIONIST', label: t('job_title.RECEPTIONIST') }, // Lễ tân
  { key: 'WAREHOUSE_KEEPER', label: t('job_title.WAREHOUSE_KEEPER') }, // Thủ kho
  { key: 'PHARMACIST', label: t('job_title.PHARMACIST') }, // Dược sĩ
  { key: 'SALES', label: t('job_title.SALES') }, // Sale
  { key: 'TELESALES', label: t('job_title.TELESALES') }, // Telesale
  { key: 'MARKETING', label: t('job_title.MARKETING') }, // Marketing
  { key: 'CUSTOMER_SUPPORT', label: t('job_title.CUSTOMER_SUPPORT') }, // Chăm sóc khách hàng
  { key: 'MARKETING_LEAD', label: t('job_title.MARKETING_LEAD') }, // Trưởng nhóm Marketing
  { key: 'CUSTOMER_SUPPORT_LEAD', label: t('job_title.CUSTOMER_SUPPORT_LEAD') }, // Trưởng nhóm CSKH
];
