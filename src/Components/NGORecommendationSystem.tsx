import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star } from 'lucide-react';

// Constants from the original Python code
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad'];
const TYPES = ['Education', 'Healthcare', 'Technology', 'Environment', 'Animal Welfare', 'Social Work', 'Women Empowerment', 'Disaster Relief'];
const SKILLS_LIST = [
  'Teaching, Leadership', 'Medical, Emergency Care', 'Programming, Data Science',
  'Art, Creativity', 'Social Work, Marketing', 'Environmental Awareness, Activism',
  'Animal Care, Rescue', 'Legal Aid, Advocacy', 'Fundraising, Community Outreach',
  'Disaster Response, Relief Work'
];

// Generate mock NGO data
const generateNGOs = () => {
  return Array.from({ length: 150 }, (_, i) => ({
    NGO_ID: i + 101,
    Type: TYPES[Math.floor(Math.random() * TYPES.length)],
    City: CITIES[Math.floor(Math.random() * CITIES.length)],
    Required_Skills: SKILLS_LIST[Math.floor(Math.random() * SKILLS_LIST.length)],
    Contact: contact ${i + 101},
    Volunteer_Count: Math.floor(Math.random() * 490) + 10,
    Review_Count: 1,
    Total_Rating: Math.round(Math.random() * 2 + 3),
    Rating: Math.round((Math.random() * 2 + 3) * 10) / 10
  }));
};

const TableHeader = ({ children }) => (
  <th className="px-4 py-2 text-left bg-gray-100 border-b">{children}</th>
);

const TableCell = ({ children }) => (
  <td className="px-4 py-2 border-b">{children}</td>
);

const NGORecommendationSystem = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [ngos, setNgos] = useState(generateNGOs());
  const [volunteers, setVolunteers] = useState({});
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    skills: '',
    experience: 'Beginner'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ... (keeping all the existing functions: processSkills, calculateSimilarity, handleRegister, recommendNGOs, handleApply, handleReview)
  
  const processSkills = (skillsInput) => {
    const parts = skillsInput.split(',');
    const weightedSkills = parts.map(part => {
      const [skill, importance] = part.split(':').map(s => s.trim());
      return importance?.toLowerCase() === 'critical' ? ${skill} ${skill} : skill;
    });
    return weightedSkills.join(' ');
  };

  const calculateSimilarity = (volunteerSkills, ngoSkills) => {
    const volunteer = new Set(volunteerSkills.toLowerCase().split(/[\s,]+/));
    const ngo = new Set(ngoSkills.toLowerCase().split(/[\s,]+/));
    const intersection = new Set([...volunteer].filter(x => ngo.has(x)));
    return intersection.size / Math.max(volunteer.size, ngo.size);
  };

  const handleRegister = () => {
    if (!formData.name || !formData.city || !formData.skills) {
      setError('Please fill in all fields');
      return;
    }

    const weightedSkills = processSkills(formData.skills);
    setVolunteers(prev => ({
      ...prev,
      [formData.name]: {
        City: formData.city,
        Weighted_Skills: weightedSkills,
        Experience: formData.experience
      }
    }));
    setCurrentUser(formData.name);
    setSuccess('Registration successful!');
    setError('');
    setActiveTab('recommend');
  };

  const recommendNGOs = () => {
    if (!volunteers[currentUser]) {
      setError('Please register first');
      return;
    }

    const profile = volunteers[currentUser];
    const expMultiplier = profile.Experience === 'Expert' ? 1.2 : 
                         profile.Experience === 'Intermediate' ? 1.1 : 1.0;

    const withSimilarity = ngos.map(ngo => {
      let similarity = calculateSimilarity(profile.Weighted_Skills, ngo.Required_Skills);
      if (ngo.City.toLowerCase() !== profile.City.toLowerCase()) {
        similarity *= 0.8;
      }
      similarity *= expMultiplier;
      return { ...ngo, Similarity: similarity };
    });

    setRecommendations(withSimilarity.sort((a, b) => b.Similarity - a.Similarity));
  };

  const handleApply = (ngoId) => {
    if (!currentUser) {
      setError('Please register first');
      return;
    }

    setApplications(prev => [...prev, { Volunteer: currentUser, NGO_ID: ngoId }]);
    setNgos(prev => prev.map(ngo => 
      ngo.NGO_ID === ngoId 
        ? { ...ngo, Volunteer_Count: ngo.Volunteer_Count + 1 }
        : ngo
    ));
    setSuccess(Successfully applied to NGO ${ngoId});
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold text-center">NGO Recommendation System</h1>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="recommend">Recommendations</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Select
                    value={formData.city}
                    onValueChange={value => setFormData(prev => ({ ...prev, city: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Skills (e.g., Teaching:critical, Communication:optional)</Label>
                  <Input
                    value={formData.skills}
                    onChange={e => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Experience Level</Label>
                  <Select
                    value={formData.experience}
                    onValueChange={value => setFormData(prev => ({ ...prev, experience: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleRegister} className="w-full">Register</Button>
              </div>
            </TabsContent>

            <TabsContent value="recommend">
              <div className="space-y-4">
                <Button onClick={recommendNGOs} className="w-full">
                  Get Recommendations
                </Button>
                {recommendations.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <TableHeader>NGO ID</TableHeader>
                          <TableHeader>Type</TableHeader>
                          <TableHeader>City</TableHeader>
                          <TableHeader>Required Skills</TableHeader>
                          <TableHeader>Rating</TableHeader>
                          <TableHeader>Match</TableHeader>
                          <TableHeader>Action</TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendations.slice(0, 10).map(ngo => (
                          <tr key={ngo.NGO_ID}>
                            <TableCell>{ngo.NGO_ID}</TableCell>
                            <TableCell>{ngo.Type}</TableCell>
                            <TableCell>{ngo.City}</TableCell>
                            <TableCell>{ngo.Required_Skills}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {ngo.Rating}
                                <Star className="w-4 h-4 ml-1 text-yellow-400" fill="currentColor" />
                              </div>
                            </TableCell>
                            <TableCell>{Math.round(ngo.Similarity * 100)}%</TableCell>
                            <TableCell>
                              <Button onClick={() => handleApply(ngo.NGO_ID)}>
                                Apply
                              </Button>
                            </TableCell>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="applications">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <TableHeader>Volunteer</TableHeader>
                      <TableHeader>NGO ID</TableHeader>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>City</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {applications
                      .filter(app => app.Volunteer === currentUser)
                      .map((app, i) => {
                        const ngo = ngos.find(n => n.NGO_ID === app.NGO_ID);
                        return (
                          <tr key={i}>
                            <TableCell>{app.Volunteer}</TableCell>
                            <TableCell>{app.NGO_ID}</TableCell>
                            <TableCell>{ngo?.Type}</TableCell>
                            <TableCell>{ngo?.City}</TableCell>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-4">
                {ngos.map(ngo => (
                  <div key={ngo.NGO_ID} className="border p-4 rounded-lg">
                    <h3 className="font-bold">NGO {ngo.NGO_ID} - {ngo.Type}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span>Rating: {ngo.Rating}</span>
                      <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                    </div>
                    {reviews[ngo.NGO_ID]?.map((review, i) => (
                      <div key={i} className="mt-2 border-t pt-2">
                        <p>By: {review.Volunteer}</p>
                        <p>Rating: {review.Rating}</p>
                        <p>{review.Review}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NGORecommendationSystem;