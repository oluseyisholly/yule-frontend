import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  ContactsParams,
  ContactsResponse,
  CreateContactPayload,
  CreateContactResponse,
  CurrentContactIdResponse,
  DeleteContactResponse,
  EnsureMyContactResponse,
  UpdateContactPayload,
  UpdateContactResponse,
} from "@/features/contacts/types";

const CONTACTS_ENDPOINT = "/contacts";
const ENSURE_MY_CONTACT_ENDPOINT = "/contacts/me/ensure";
const MY_CONTACT_ID_ENDPOINT = "/contacts/me/contact-id";

export async function getContacts(params: ContactsParams = {}) {
  return getApi<ContactsResponse>(CONTACTS_ENDPOINT, {
    params: {
      per_page: params.per_page ?? 25,
      page: params.page ?? 1,
      searchQuery: params.searchQuery ?? "",
    },
  });
}

export async function createContact(payload: CreateContactPayload) {
  return postApi<CreateContactResponse, CreateContactPayload>(
    CONTACTS_ENDPOINT,
    payload,
  );
}

export async function updateContact(
  id: string,
  payload: UpdateContactPayload,
) {
  return patchApi<UpdateContactResponse, UpdateContactPayload>(
    `${CONTACTS_ENDPOINT}/${id}`,
    payload,
  );
}

export async function deleteContact(id: string) {
  return deleteApi<DeleteContactResponse>(`${CONTACTS_ENDPOINT}/${id}`);
}

export async function ensureMyContact() {
  return postApi<EnsureMyContactResponse>(ENSURE_MY_CONTACT_ENDPOINT);
}

export async function getMyContactId() {
  return getApi<CurrentContactIdResponse>(MY_CONTACT_ID_ENDPOINT);
}
