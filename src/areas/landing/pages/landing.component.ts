import { Component, OnInit } from '@angular/core';
import { LayoutService } from '@/shared/services/layout.service';
import { ScrollService } from '@/shared/services/scroll.service';
import { FooterComponent } from '@/shared/ui/footer/footer.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { FeaturesSectionComponent } from './components/features-section/features-section.component';
import { UseCasesSectionComponent } from './components/use-cases-section/use-cases-section.component';
import { ContactSectionComponent } from './components/contact-section/contact-section.component';
import { FaqSectionComponent } from './components/faq-section/faq-section.component';

/**
 * Landing page - orchestrates marketing widgets
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    FooterComponent,
    HeroSectionComponent,
    FeaturesSectionComponent,
    UseCasesSectionComponent,
    ContactSectionComponent,
    FaqSectionComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  constructor(
    private layoutService: LayoutService,
    private scrollService: ScrollService
  ) {}

  ngOnInit(): void {
    this.layoutService.setTitle('Orders Platform');
    this.layoutService.setNavItems([
      { label: 'Features', action: () => this.handleScroll('features') },
      { label: 'Use Cases', action: () => this.handleScroll('use-cases') },
      { label: 'FAQ', action: () => this.handleScroll('faq') },
      { label: 'Contact', action: () => this.handleScroll('contact') },
    ]);
  }

  handleScroll(sectionId: string): void {
    this.scrollService.scrollToSection(sectionId);
  }
}
