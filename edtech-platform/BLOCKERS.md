# Backend Integration Blockers & Gap Log

This log tracks all backend API gaps, missing controllers, or schema mismatches encountered during frontend integration.

---


## 2. Authentication Role Claims Mapping

- **Affected Endpoints**:
  - `Account/login`, `Account/register`, `Account/details`
- **Notes**:
  - Ensure JWT token issued by backend includes `ClaimTypes.Role` / `role` claims for `Admin`, `Student`, and `Instructor` so `AuthStore.hasAnyRole(...)` works seamlessly.
