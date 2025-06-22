import React from 'react';

const FontExamples = () => {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Font Examples</h1>

      {/* Open Sans Examples */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Open Sans Font</h2>
        <p className="font-open-sans text-base font-normal">
          This is Open Sans Regular - Great for body text and readable content.
        </p>
        <p className="font-open-sans text-lg font-medium">
          This is Open Sans Medium - Perfect for subheadings.
        </p>
        <p className="font-open-sans text-xl font-semibold">
          This is Open Sans Semi-Bold - Ideal for section headers.
        </p>
        <p className="font-open-sans text-2xl font-bold">
          This is Open Sans Bold - Great for main headings.
        </p>
      </div>

      {/* Inter Examples */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Inter Font</h2>
        <p className="font-inter text-base font-normal">
          This is Inter Regular - Excellent for modern UI interfaces.
        </p>
        <p className="font-inter text-lg font-medium">
          This is Inter Medium - Perfect for buttons and labels.
        </p>
        <p className="font-inter text-xl font-semibold">
          This is Inter Semi-Bold - Great for navigation items.
        </p>
        <p className="font-inter text-2xl font-bold">
          This is Inter Bold - Ideal for dashboard headings.
        </p>
      </div>

      {/* Poppins Examples */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Poppins Font</h2>
        <p className="font-poppins text-base font-normal">
          This is Poppins Regular - Great for modern, friendly designs.
        </p>
        <p className="font-poppins text-lg font-medium">
          This is Poppins Medium - Perfect for card titles.
        </p>
        <p className="font-poppins text-xl font-semibold">
          This is Poppins Semi-Bold - Excellent for feature headings.
        </p>
        <p className="font-poppins text-2xl font-bold">
          This is Poppins Bold - Ideal for hero sections.
        </p>
      </div>

      {/* Combined Usage Examples */}
      <div className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold">Combined Usage Examples</h2>

        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-poppins text-xl font-bold text-primary mb-2">
            Card Title (Poppins Bold)
          </h3>
          <p className="font-inter text-sm font-medium text-muted-foreground mb-2">
            Subtitle with Inter Medium
          </p>
          <p className="font-open-sans text-base font-normal text-foreground">
            Body content using Open Sans Regular for maximum readability and user experience.
          </p>
        </div>

        <div className="bg-primary text-primary-foreground p-4 rounded-lg">
          <h3 className="font-poppins text-2xl font-bold mb-2">Hero Section (Poppins Bold)</h3>
          <p className="font-inter text-lg font-medium mb-4">Subheading with Inter Medium</p>
          <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded font-inter font-semibold">
            Call to Action (Inter Semi-Bold)
          </button>
        </div>
      </div>
    </div>
  );
};

export default FontExamples;
