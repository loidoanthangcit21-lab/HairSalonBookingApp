package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.response.SalonServiceResponse;
import demo.booking.hairsalon.service.SalonServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/services")
public class SalonServiceController {

    private final SalonServiceService salonServiceService;

    @GetMapping
    public ApiResponse<List<SalonServiceResponse>> getAllServices() {
        return ApiResponse.success(salonServiceService.getAllServices(), "Services retrieved successfully", null);
    }

    @GetMapping("/{id}")
    public ApiResponse<SalonServiceResponse> getServiceById(@PathVariable UUID id) {
        return ApiResponse.success(salonServiceService.getServiceById(id), "Service retrieved successfully", null);
    }
}
