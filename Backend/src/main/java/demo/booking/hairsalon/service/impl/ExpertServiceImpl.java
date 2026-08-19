package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.response.ExpertResponse;
import demo.booking.hairsalon.model.entity.Expert;
import demo.booking.hairsalon.model.entity.ExpertImage;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.repository.ExpertRepository;
import demo.booking.hairsalon.service.ExpertService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpertServiceImpl implements ExpertService {

    private final ExpertRepository expertRepository;

    @Override
    public List<ExpertResponse> getAllActiveExperts() {
        return expertRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpertResponse> getExpertsByCategory(UUID categoryId) {
        return expertRepository.findActiveExpertsByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ExpertResponse getExpertById(UUID id) {
        Expert expert = expertRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.EXPERT_NOT_FOUND));
        return mapToResponse(expert);
    }

    private ExpertResponse mapToResponse(Expert expert) {
        List<String> portfolio = expert.getExpertImages() != null ?
                expert.getExpertImages().stream().map(ExpertImage::getImageUrl).collect(Collectors.toList()) :
                List.of();

        List<demo.booking.hairsalon.model.dto.response.CategoryResponse> categories = expert.getExpertCategories() != null ?
                expert.getExpertCategories().stream()
                        .map(ec -> new demo.booking.hairsalon.model.dto.response.CategoryResponse(
                                ec.getCategory().getId(),
                                ec.getCategory().getName(),
                                ec.getCategory().getDescription(),
                                ec.getCategory().isActive()
                        ))
                        .collect(Collectors.toList()) : List.of();

        return new ExpertResponse(
                expert.getId(),
                expert.getFullName(),
                expert.getPhone(),
                expert.getDescription(),
                expert.getExperienceYears(),
                expert.getAvatarUrl(),
                expert.isActive(),
                portfolio,
                categories
        );
    }

}
