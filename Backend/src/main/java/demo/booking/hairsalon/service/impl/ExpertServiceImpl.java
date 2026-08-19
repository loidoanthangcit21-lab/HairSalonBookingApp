package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.request.ExpertRequest;
import demo.booking.hairsalon.model.dto.response.CategoryResponse;
import demo.booking.hairsalon.model.dto.response.ExpertResponse;
import demo.booking.hairsalon.model.entity.Expert;
import demo.booking.hairsalon.model.entity.ExpertImage;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.repository.ExpertImageRepository;
import demo.booking.hairsalon.repository.ExpertRepository;
import demo.booking.hairsalon.service.ExpertService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpertServiceImpl implements ExpertService {

    private final ExpertRepository expertRepository;
    private final ExpertImageRepository expertImageRepository;

    @Override
    public List<ExpertResponse> getAllActiveExperts() {
        return expertRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpertResponse> getAllExpertsAdmin() {
        return expertRepository.findAll().stream()
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

    @Override
    @Transactional
    public ExpertResponse createExpert(ExpertRequest request) {
        Expert expert = Expert.builder()
                .fullName(request.fullName())
                .phone(request.phone())
                .description(request.description())
                .experienceYears(request.experienceYears() != null ? request.experienceYears() : 0)
                .avatarUrl(request.avatarUrl())
                .isActive(request.isActive() != null ? request.isActive() : true)
                .build();

        Expert savedExpert = expertRepository.save(expert);

        if (request.portfolioImages() != null && !request.portfolioImages().isEmpty()) {
            int order = 1;
            for (String imgUrl : request.portfolioImages()) {
                ExpertImage img = ExpertImage.builder()
                        .expert(savedExpert)
                        .imageUrl(imgUrl)
                        .displayOrder(order++)
                        .build();
                expertImageRepository.save(img);
            }
        }

        return mapToResponse(expertRepository.findById(savedExpert.getId()).orElse(savedExpert));
    }

    @Override
    @Transactional
    public ExpertResponse updateExpert(UUID id, ExpertRequest request) {
        Expert expert = expertRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.EXPERT_NOT_FOUND));

        expert.setFullName(request.fullName());
        expert.setPhone(request.phone());
        expert.setDescription(request.description());
        if (request.experienceYears() != null) {
            expert.setExperienceYears(request.experienceYears());
        }
        expert.setAvatarUrl(request.avatarUrl());
        if (request.isActive() != null) {
            expert.setActive(request.isActive());
        }

        return mapToResponse(expertRepository.save(expert));
    }

    @Override
    @Transactional
    public ExpertResponse toggleExpertActive(UUID id) {
        Expert expert = expertRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.EXPERT_NOT_FOUND));

        expert.setActive(!expert.isActive());
        return mapToResponse(expertRepository.save(expert));
    }

    @Override
    @Transactional
    public void deleteExpert(UUID id) {
        Expert expert = expertRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.EXPERT_NOT_FOUND));
        expertRepository.delete(expert);
    }

    private ExpertResponse mapToResponse(Expert expert) {
        List<String> portfolio = expert.getExpertImages() != null ?
                expert.getExpertImages().stream().map(ExpertImage::getImageUrl).collect(Collectors.toList()) :
                List.of();

        List<CategoryResponse> categories = expert.getExpertCategories() != null ?
                expert.getExpertCategories().stream()
                        .filter(ec -> ec.getCategory() != null)
                        .map(ec -> new CategoryResponse(
                                ec.getCategory().getId(),
                                ec.getCategory().getName(),
                                ec.getCategory().getDescription(),
                                ec.getCategory().isActive()
                        )).collect(Collectors.toList()) : List.of();

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
