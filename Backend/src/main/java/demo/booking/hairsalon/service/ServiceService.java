package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.request.ServiceRequest;
import demo.booking.hairsalon.model.dto.response.ServiceResponse;

import java.util.List;
import java.util.UUID;

public interface ServiceService {
    List<ServiceResponse> getAllActiveServices();
    List<ServiceResponse> getAllServicesAdmin();
    List<ServiceResponse> getServicesByCategory(UUID categoryId);
    ServiceResponse getServiceById(UUID id);
    ServiceResponse createService(ServiceRequest request);
    ServiceResponse updateService(UUID id, ServiceRequest request);
    void deleteService(UUID id);
}
