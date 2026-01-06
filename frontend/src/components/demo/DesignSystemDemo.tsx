import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Skeleton,
  SkeletonCard,
  SkeletonProfile,
  Spinner,
  LoadingOverlay,
} from '../ui';

const DesignSystemDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50 circuit-bg-light">
      <div className="container-responsive py-12">
        <div className="text-center mb-12">
          <h1 className="heading-hero text-gradient-golden mb-4">
            Derji Productions Design System
          </h1>
          <p className="body-large text-secondary-600 max-w-2xl mx-auto">
            A comprehensive design system featuring the distinctive golden circuit-board aesthetic
            with responsive components and modern typography.
          </p>
        </div>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="heading-section text-secondary-900 mb-8">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Primary Colors */}
            <Card variant="hover">
              <CardHeader>
                <h3 className="heading-card text-primary-600">Primary (Golden)</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className={`w-full h-12 rounded-lg mb-2 bg-primary-${shade}`}
                        title={`primary-${shade}`}
                      />
                      <span className="caption text-secondary-600">{shade}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Secondary Colors */}
            <Card variant="hover">
              <CardHeader>
                <h3 className="heading-card text-secondary-600">Secondary (Slate)</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className={`w-full h-12 rounded-lg mb-2 bg-secondary-${shade}`}
                        title={`secondary-${shade}`}
                      />
                      <span className="caption text-secondary-600">{shade}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Accent Colors */}
            <Card variant="hover">
              <CardHeader>
                <h3 className="heading-card text-accent-600">Accent (Purple)</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className={`w-full h-12 rounded-lg mb-2 bg-accent-${shade}`}
                        title={`accent-${shade}`}
                      />
                      <span className="caption text-secondary-600">{shade}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="heading-section text-secondary-900 mb-8">Typography</h2>
          <Card>
            <CardBody className="space-y-6">
              <div>
                <h1 className="heading-hero text-secondary-900">Hero Heading</h1>
                <p className="body-small text-secondary-500 mt-2">heading-hero class</p>
              </div>
              <div>
                <h2 className="heading-section text-secondary-900">Section Heading</h2>
                <p className="body-small text-secondary-500 mt-2">heading-section class</p>
              </div>
              <div>
                <h3 className="heading-card text-secondary-900">Card Heading</h3>
                <p className="body-small text-secondary-500 mt-2">heading-card class</p>
              </div>
              <div>
                <p className="body-large text-secondary-700">
                  Large body text for important content and introductions.
                </p>
                <p className="body-small text-secondary-500 mt-2">body-large class</p>
              </div>
              <div>
                <p className="body-normal text-secondary-700">
                  Normal body text for regular content and descriptions.
                </p>
                <p className="body-small text-secondary-500 mt-2">body-normal class</p>
              </div>
              <div>
                <p className="body-small text-secondary-600">
                  Small body text for captions and secondary information.
                </p>
                <p className="body-small text-secondary-500 mt-2">body-small class</p>
              </div>
              <div>
                <p className="caption text-secondary-500">Caption Text</p>
                <p className="body-small text-secondary-500 mt-2">caption class</p>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="heading-section text-secondary-900 mb-8">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <h3 className="heading-card">Button Variants</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="golden">Golden</Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="heading-card">Button Sizes</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-16">
          <h2 className="heading-section text-secondary-900 mb-8">Form Elements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <h3 className="heading-card">Input Variants</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Default Input"
                  placeholder="Enter text..."
                  helpText="This is a help text"
                />
                <Input
                  label="Required Input"
                  placeholder="Required field..."
                  required
                />
                <Input
                  label="Error State"
                  placeholder="Invalid input..."
                  variant="error"
                  error="This field has an error"
                />
                <Input
                  label="Success State"
                  placeholder="Valid input..."
                  variant="success"
                />
                <Input
                  label="Golden Variant"
                  placeholder="Golden input..."
                  variant="golden"
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="heading-card">Input Sizes</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  label="Small Input"
                  size="sm"
                  placeholder="Small size..."
                />
                <Input
                  label="Medium Input"
                  size="md"
                  placeholder="Medium size..."
                />
                <Input
                  label="Large Input"
                  size="lg"
                  placeholder="Large size..."
                />
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <h2 className="heading-section text-secondary-900 mb-8">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <h3 className="heading-card">Default Card</h3>
              </CardHeader>
              <CardBody>
                <p className="body-normal text-secondary-600">
                  This is a default card with header, body, and footer sections.
                </p>
              </CardBody>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="hover">
              <CardHeader>
                <h3 className="heading-card">Hover Card</h3>
              </CardHeader>
              <CardBody>
                <p className="body-normal text-secondary-600">
                  This card has hover effects with lift and shadow animations.
                </p>
              </CardBody>
              <CardFooter>
                <Button variant="outline" size="sm">Hover Me</Button>
              </CardFooter>
            </Card>

            <Card variant="golden">
              <CardHeader>
                <h3 className="heading-card text-primary-700">Golden Card</h3>
              </CardHeader>
              <CardBody>
                <p className="body-normal text-secondary-600">
                  This card features the golden circuit-board styling.
                </p>
              </CardBody>
              <CardFooter>
                <Button variant="golden" size="sm">Golden Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Loading States */}
        <section className="mb-16">
          <h2 className="heading-section text-secondary-900 mb-8">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <h3 className="heading-card">Spinners</h3>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-4">
                  <Spinner size="sm" />
                  <span className="body-normal">Small</span>
                </div>
                <div className="flex items-center gap-4">
                  <Spinner size="md" />
                  <span className="body-normal">Medium</span>
                </div>
                <div className="flex items-center gap-4">
                  <Spinner size="lg" />
                  <span className="body-normal">Large</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button loading>Loading Button</Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="heading-card">Skeletons</h3>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <h4 className="body-normal font-medium mb-3">Profile Skeleton</h4>
                  <SkeletonProfile />
                </div>
                <div>
                  <h4 className="body-normal font-medium mb-3">Text Skeleton</h4>
                  <Skeleton variant="title" className="mb-2" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="75%" />
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="mb-16">
          <h2 className="heading-section text-secondary-900 mb-8">Interactive Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LoadingOverlay isLoading={isLoading}>
              <Card>
                <CardHeader>
                  <h3 className="heading-card">Loading Overlay Demo</h3>
                </CardHeader>
                <CardBody>
                  <p className="body-normal text-secondary-600 mb-4">
                    Click the button below to see the loading overlay in action.
                  </p>
                  <Button onClick={handleLoadingDemo} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Start Loading Demo'}
                  </Button>
                </CardBody>
              </Card>
            </LoadingOverlay>

            <Card>
              <CardHeader>
                <h3 className="heading-card">Modal Demo</h3>
              </CardHeader>
              <CardBody>
                <p className="body-normal text-secondary-600 mb-4">
                  Click the button below to open a modal dialog.
                </p>
                <Button variant="golden" onClick={() => setIsModalOpen(true)}>
                  Open Modal
                </Button>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Skeleton Demo */}
        <section className="mb-16">
          <h2 className="heading-section text-secondary-900 mb-8">Skeleton Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          Design System Modal
        </ModalHeader>
        <ModalBody>
          <p className="body-normal text-secondary-600 mb-4">
            This is a modal dialog showcasing the design system's modal component
            with proper styling and animations.
          </p>
          <Input
            label="Sample Input"
            placeholder="Type something..."
            variant="golden"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="golden" onClick={() => setIsModalOpen(false)}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default DesignSystemDemo;