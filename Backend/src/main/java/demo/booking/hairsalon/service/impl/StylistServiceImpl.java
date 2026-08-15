package demo.booking.hairsalon.service.impl;

import demo.booking.hairsalon.exception.BusinessException;
import demo.booking.hairsalon.model.dto.response.StylistResponse;
import demo.booking.hairsalon.model.entity.StylistProfile;
import demo.booking.hairsalon.model.enums.ErrorCode;
import demo.booking.hairsalon.repository.StylistProfileRepository;
import demo.booking.hairsalon.service.StylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StylistServiceImpl implements StylistService {

    private final StylistProfileRepository stylistProfileRepository;

    @Override
    public List<StylistResponse> getAllStylists() {
        return stylistProfileRepository.findAll().stream()
                .filter(profile -> profile.getUser().isEnabled())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public StylistResponse getStylistById(UUID id) {
        StylistProfile profile = stylistProfileRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.STYLIST_NOT_FOUND));
        return mapToResponse(profile);
    }

    private StylistResponse mapToResponse(StylistProfile profile) {
        return new StylistResponse(
                profile.getUser().getId(),
                profile.getUser().getFirstName() + " " + profile.getUser().getLastName(),
                profile.getSpecialty(),
                profile.getRating(),
                profile.getExperienceYears(),
                profile.getUser().getAvatarUrl(),
                profile.getBio(),
                java.util.Collections.emptyList()
        );
    }
}
