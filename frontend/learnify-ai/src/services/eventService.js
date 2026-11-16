import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

const getEvents = async (start, end) => {
  try {
    const response = await axiosInstance.get(API_PATHS.EVENTS.GET_EVENTS, {
      params: { start, end },
    });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch events' };
  }
};

const createEvent = async (eventData) => {
  try {
    const response = await axiosInstance.post(API_PATHS.EVENTS.CREATE_EVENT, eventData);
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create event' };
  }
};

const updateEvent = async (id, eventData) => {
  try {
    const response = await axiosInstance.put(API_PATHS.EVENTS.UPDATE_EVENT(id), eventData);
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update event' };
  }
};

const deleteEvent = async (id) => {
  try {
    const response = await axiosInstance.delete(API_PATHS.EVENTS.DELETE_EVENT(id));
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete event' };
  }
};

const eventService = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};

export default eventService;