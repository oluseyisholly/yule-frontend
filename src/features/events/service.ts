import { getApi } from "@/lib/api";
import type {
  ParticipatedEventsParams,
  ParticipatedEventsResponse,
} from "@/features/events/types";

const PARTICIPATED_EVENTS_ENDPOINT = "/events/participated";

export async function getParticipatedEvents(
  params: ParticipatedEventsParams = {},
) {
  return getApi<ParticipatedEventsResponse>(PARTICIPATED_EVENTS_ENDPOINT, {
    params: {
      per_page: params.per_page ?? 6,
      page: params.page ?? 1,
      searchQuery: params.searchQuery ?? "",
    },
  });
}
