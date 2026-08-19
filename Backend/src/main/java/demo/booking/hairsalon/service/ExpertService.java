package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.request.ExpertRequest;
import demo.booking.hairsalon.model.dto.response.ExpertResponse;

import java.util.List;
import java.util.UUID;

public interface ExpertService {
    List<ExpertResponse> getAllActiveExperts();
    List<ExpertResponse> getAllExpertsAdmin();
    List<ExpertResponse> getExpertsByCategory(UUID categoryId);
    ExpertResponse getExpertById(UUID id);
    ExpertResponse createExpert(ExpertRequest request);
    ExpertResponse updateExpert(UUID id, ExpertRequest request);
    ExpertResponse toggleExpertActive(UUID id);
    void deleteExpert(UUID id);
}
