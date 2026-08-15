package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.response.SalonServiceResponse;
import demo.booking.hairsalon.model.entity.SalonService;
import demo.booking.hairsalon.model.enums.ErrorCode; // Will add missing ErrorCode later if needed, reuse USER_NOT_FOUND or generic for now, but better create SERVICE_NOT_FOUND
import demo.booking.hairsalon.repository.SalonServiceRepository;
import demo.booking.hairsalon.service.SalonServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalonServiceServiceImpl implements SalonServiceService {

    private final SalonServiceRepository salonServiceRepository;

    @Override
    public List<SalonServiceResponse> getAllServices() {
        return salonServiceRepository.findAll().stream()
                .filter(SalonService::isActive)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SalonServiceResponse getServiceById(UUID id) {
        SalonService service = salonServiceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND)); 
        return mapToResponse(service);
    }

    private SalonServiceResponse mapToResponse(SalonService service) {
        return new SalonServiceResponse(
                service.getId(),
                service.getName(),
                service.getDescription(),
                service.getPrice(),
                service.getDuration(),
                service.getImageUrl(),
                service.getCategory() != null ? service.getCategory().getId() : null,
                service.getCategory() != null ? service.getCategory().getName() : null
        );
    }
}
