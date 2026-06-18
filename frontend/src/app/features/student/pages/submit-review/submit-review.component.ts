// src/app/features/student/pages/submit-review/submit-review.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';

@Component({
    selector: 'app-submit-review',
    templateUrl: './submit-review.component.html',
    styleUrls: ['./submit-review.component.css']
})
export class SubmitReviewComponent implements OnInit {

    sessionId!: number;
    stars = [1, 2, 3, 4, 5];
    selectedRating = 0;
    hoveredRating  = 0;
    comment        = '';
    submitting     = false;
    successMsg     = '';
    errorMsg       = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private reviewService: ReviewService
    ) {}

    ngOnInit(): void {
        // Read session ID from URL — e.g. /student/submit-review/8
        this.sessionId = Number(this.route.snapshot.paramMap.get('id'));
        if (!this.sessionId) {
            this.errorMsg = 'Invalid session. Please go back and try again.';
        }
    }

    setRating(star: number): void {
        this.selectedRating = star;
    }

    getStarClass(star: number): string {
        const active = this.hoveredRating || this.selectedRating;
        return star <= active ? 'star filled' : 'star empty';
    }

    onSubmit(): void {
        if (this.selectedRating === 0) {
            this.errorMsg = 'Please select a star rating.';
            return;
        }
        if (!this.sessionId) {
            this.errorMsg = 'Invalid session ID.';
            return;
        }

        this.submitting = true;
        this.errorMsg   = '';

        this.reviewService.submitReview(this.sessionId, {
            rating:  this.selectedRating,
            comment: this.comment || undefined
        }).subscribe({
            next: () => {
                this.submitting  = false;
                this.successMsg  = 'Review submitted successfully! Thank you.';
                // Go back to My Sessions after 2 seconds
                setTimeout(() => this.router.navigate(['/student/sessions']), 2000);
            },
            error: (err: any) => {
                this.submitting = false;
                this.errorMsg   = err.error?.message || 'Failed to submit review. Please try again.';
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/student/sessions']);
    }
}