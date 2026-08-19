package demo.booking.hairsalon.service;

import demo.booking.hairsalon.model.dto.response.ExpertResponse;

import java.util.List;
import java.util.UUID;

public interface ExpertService {
    List<ExpertResponse> getAllActiveExperts();
    List<ExpertResponse> getExpertsByCategory(UUID categoryId);
    ExpertResponse getExpertById(UUID id);
}
