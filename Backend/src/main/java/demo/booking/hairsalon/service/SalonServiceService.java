package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.response.SalonServiceResponse;

import java.util.List;
import java.util.UUID;

public interface SalonServiceService {
    List<SalonServiceResponse> getAllServices();
    SalonServiceResponse getServiceById(UUID id);
}
