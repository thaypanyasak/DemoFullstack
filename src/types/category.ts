export interface Category {
  id: number;
  name: string;
  nameLao: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFormData {
  name: string;
  nameLao: string;
}

export const DEFAULT_CATEGORY_FORM_DATA: CategoryFormData = {
  name: "",
  nameLao: "",
};
