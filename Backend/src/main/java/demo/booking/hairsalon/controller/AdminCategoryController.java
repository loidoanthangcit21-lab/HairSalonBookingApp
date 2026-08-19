package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.request.CategoryRequest;
import demo.booking.hairsalon.model.dto.response.CategoryResponse;
import demo.booking.hairsalon.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllCategoriesAdmin() {
        return ApiResponse.success(categoryService.getAllCategoriesAdmin(), "Categories retrieved successfully", null);
    }

    @PostMapping
    public ApiResponse<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.success(categoryService.createCategory(request), "Category created successfully", null);
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.success(categoryService.updateCategory(id, request), "Category updated successfully", null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ApiResponse.success(null, "Category deleted successfully", null);
    }
}
