package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.response.ServiceResponse;
import demo.booking.hairsalon.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    public ApiResponse<List<ServiceResponse>> getAllActiveServices() {
        return ApiResponse.success(serviceService.getAllActiveServices(), "Services retrieved successfully", null);
    }

    @GetMapping("/category/{categoryId}")
    public ApiResponse<List<ServiceResponse>> getServicesByCategory(@PathVariable UUID categoryId) {
        return ApiResponse.success(serviceService.getServicesByCategory(categoryId), "Services retrieved successfully", null);
    }

    @GetMapping("/{id}")
    public ApiResponse<ServiceResponse> getServiceById(@PathVariable UUID id) {
        return ApiResponse.success(serviceService.getServiceById(id), "Service retrieved successfully", null);
    }
}
