package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.request.ServiceRequest;
import demo.booking.hairsalon.model.dto.response.ServiceResponse;
import demo.booking.hairsalon.model.entity.Category;
import demo.booking.hairsalon.model.entity.Service;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.repository.CategoryRepository;
import demo.booking.hairsalon.repository.ServiceRepository;
import demo.booking.hairsalon.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<ServiceResponse> getAllActiveServices() {
        return serviceRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceResponse> getAllServicesAdmin() {
        return serviceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceResponse> getServicesByCategory(UUID categoryId) {
        return serviceRepository.findByCategoryIdAndIsActiveTrue(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceResponse getServiceById(UUID id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));
        return mapToResponse(service);
    }

    @Override
    @Transactional
    public ServiceResponse createService(ServiceRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));

        Service service = Service.builder()
                .category(category)
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .imageUrl(request.imageUrl())
                .isActive(request.isActive() != null ? request.isActive() : true)
                .build();

        return mapToResponse(serviceRepository.save(service));
    }

    @Override
    @Transactional
    public ServiceResponse updateService(UUID id, ServiceRequest request) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));

        service.setCategory(category);
        service.setName(request.name());
        service.setDescription(request.description());
        service.setPrice(request.price());
        service.setImageUrl(request.imageUrl());
        if (request.isActive() != null) {
            service.setActive(request.isActive());
        }

        return mapToResponse(serviceRepository.save(service));
    }

    @Override
    @Transactional
    public void deleteService(UUID id) {
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));
        serviceRepository.delete(service);
    }

    private ServiceResponse mapToResponse(Service service) {
        return new ServiceResponse(
                service.getId(),
                service.getName(),
                service.getDescription(),
                service.getPrice(),
                service.getImageUrl(),
                service.getCategory() != null ? service.getCategory().getId() : null,
                service.getCategory() != null ? service.getCategory().getName() : null
        );
    }
}
