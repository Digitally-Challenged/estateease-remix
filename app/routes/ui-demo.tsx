import { useState } from "react"
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  Checkbox, 
  CheckboxGroup,
  Radio, 
  RadioGroup,
  Switch,
  FormField,
  Spinner,
  Skeleton,
  SkeletonContainer,
  Progress,
  PageLoader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui"
import { Plus, Download } from "lucide-react"

/**
 * UI Components Demo Page
 * Showcases all UI components for the EstateEase application
 */
export default function UIDemo() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(30)
  const [showPageLoader, setShowPageLoader] = useState(false)

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
    { value: 'option4', label: 'Option 4' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {showPageLoader && (
        <PageLoader 
          fullScreen 
          backdrop 
          message="Loading demo content..." 
        />
      )}
      
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">UI Components Demo</h1>
          <p className="text-gray-600 mt-2">EstateEase Core UI Component Library</p>
        </div>

        {/* Button Component Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button styles and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon={<Plus className="h-4 w-4" />}>Add Item</Button>
              <Button rightIcon={<Download className="h-4 w-4" />}>Download</Button>
            </div>
            
            <div>
              <Button fullWidth>Full Width Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Components Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>Input fields and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="john@example.com"
                helperText="We'll never share your email"
                required
              />
              
              <Input 
                label="Password" 
                type="password" 
                error
                errorMessage="Password must be at least 8 characters"
              />
            </div>

            {/* Textarea */}
            <div>
              <FormField label="Description" helperText="Maximum 500 characters">
                <Textarea 
                  placeholder="Enter a detailed description..."
                  maxLength={500}
                  rows={3}
                />
              </FormField>
            </div>

            {/* Select */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Select Option" required>
                <Select 
                  placeholder="Choose an option"
                  options={selectOptions}
                />
              </FormField>
              
              <FormField label="Error Select" error="Please select a valid option">
                <Select 
                  options={selectOptions}
                  error
                />
              </FormField>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <CheckboxGroup label="Select Features" required>
                <Checkbox label="Email notifications" defaultChecked />
                <Checkbox label="SMS alerts" />
                <Checkbox label="Marketing emails" helperText="Receive updates about new features" />
              </CheckboxGroup>
            </div>

            {/* Radio Buttons */}
            <div>
              <RadioGroup label="Select Plan" name="plan" required>
                <Radio value="basic" label="Basic - $9/month" />
                <Radio value="pro" label="Pro - $29/month" />
                <Radio value="enterprise" label="Enterprise - Contact us" />
              </RadioGroup>
            </div>

            {/* Switches */}
            <div className="space-y-4">
              <Switch 
                label="Enable dark mode" 
                helperText="Applies system-wide theme changes"
              />
              <Switch label="Auto-save" size="sm" defaultChecked />
              <Switch label="Advanced settings" size="lg" />
            </div>
          </CardContent>
        </Card>

        {/* Loading Components Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>Spinners, skeletons, and progress indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Spinners */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Spinners</h3>
              <div className="flex items-center gap-8">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
                <Spinner label="Loading data..." />
              </div>
            </div>

            {/* Skeletons */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Skeletons</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton variant="circular" width={48} height={48} />
                  <div className="flex-1">
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="text" width="50%" />
                  </div>
                </div>
                
                <SkeletonContainer count={3} spacing="sm">
                  <Skeleton variant="rectangular" height={80} />
                </SkeletonContainer>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Progress Bars</h3>
              <Progress value={progress} showLabel />
              <Progress value={75} variant="success" size="lg" />
              <Progress value={90} variant="warning" animate />
              <Progress value={25} variant="danger" />
              
              <div className="flex gap-4">
                <Button 
                  size="sm"
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                >
                  Decrease
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                >
                  Increase
                </Button>
              </div>
            </div>

            {/* Page Loader */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Page Loader</h3>
              <Button onClick={() => {
                setShowPageLoader(true)
                setTimeout(() => setShowPageLoader(false), 3000)
              }}>
                Show Page Loader (3s)
              </Button>
              
              <div className="border border-gray-200 rounded-lg">
                <PageLoader message="Loading content..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Combined Example */}
        <Card>
          <CardHeader>
            <CardTitle>Combined Example</CardTitle>
            <CardDescription>Real-world form implementation</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault()
              setLoading(true)
              setTimeout(() => setLoading(false), 2000)
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="First Name" 
                  placeholder="John"
                  required
                />
                <Input 
                  label="Last Name" 
                  placeholder="Doe"
                  required
                />
              </div>
              
              <Input 
                label="Email" 
                type="email" 
                placeholder="john.doe@example.com"
                required
              />
              
              <FormField label="Country" required>
                <Select 
                  options={[
                    { value: 'us', label: 'United States' },
                    { value: 'ca', label: 'Canada' },
                    { value: 'uk', label: 'United Kingdom' },
                  ]}
                  placeholder="Select your country"
                />
              </FormField>
              
              <FormField label="Bio">
                <Textarea 
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={200}
                />
              </FormField>
              
              <CheckboxGroup>
                <Checkbox label="I agree to the terms and conditions" required />
                <Checkbox label="Subscribe to newsletter" />
              </CheckboxGroup>
              
              <div className="flex gap-4">
                <Button type="submit" loading={loading}>
                  {loading ? 'Submitting...' : 'Submit Form'}
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}