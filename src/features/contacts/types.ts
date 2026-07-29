export type ContactRelationship = {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
};

export type ContactConnection = {
  id: string;
  ownerContactId: string;
  contactId: string;
  relationshipId?: string | null;
  relationship?: ContactRelationship | null;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userId?: string | null;
  profileUrl?: string | null;
  gender: "male" | "female" | string;
  ageRange?: string | null;
  phone: string;
  phoneNumber?: string;
  createdById?: string | null;
  note: string;
  connection?: ContactConnection | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactEnumOption = {
  label: string;
  value: string;
};

export type ContactEnumsResponse = {
  code: number;
  message: string;
  data: {
    genders: ContactEnumOption[];
    ageRanges: ContactEnumOption[];
  };
};

export type ContactsParams = {
  per_page?: number;
  page?: number;
  searchQuery?: string;
};

export type ContactsPage = {
  data: Contact[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ContactsResponse = {
  code: number;
  message: string;
  data: ContactsPage;
};

export type CreateContactPayload = {
  gender: "male" | "female";
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  ageRange?: string;
};

export type CreateBulkContactsPayload = {
  contacts: CreateContactPayload[];
};

export type UpdateContactPayload = Partial<CreateContactPayload>;

export type CreateContactResponse = {
  code: number;
  message: string;
  data: Contact;
};

export type UpdateContactResponse = CreateContactResponse;

export type CreateBulkContactsResponse = {
  code: number;
  message: string;
  data: Contact[];
};

export type CurrentContactIdResponse = {
  code: number;
  message: string;
  data: {
    contactId: string;
  };
};

export type DeleteContactResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type EnsureMyContactResponse = {
  code: number;
  message: string;
  data: Contact | null;
};

export type SyncContactPayload = {
  gender: "male" | "female";
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  userId: string;
  profileUrl: string;
  ageRange?: string;
};

export type SyncContactResponse = {
  code: number;
  message: string;
  data?: Contact | null;
};
