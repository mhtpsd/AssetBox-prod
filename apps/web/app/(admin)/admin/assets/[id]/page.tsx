'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  FileText,
  Link2,
  Upload,
  User,
  Calendar,
  DollarSign,
  Tag,
  Shield,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

interface Props {
  params: { id:  string };
}

const proofIcons:  Record<string, any> = {
  TEXT: FileText,
  LINK: Link2,
  FILE: Upload,
};

export default function AdminAssetReviewPage({ params }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: asset, isLoading } = useQuery({
    queryKey: ['admin-asset', params.id],
    queryFn: async () => {
      const response = await adminApi.getAssetForReview(params.id);
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      await adminApi.approveAsset(params.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-assets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Asset approved successfully');
      router.push('/admin/assets');
    },
    onError:  () => {
      toast.error('Failed to approve asset');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      await adminApi.rejectAsset(params.id, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-assets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Asset rejected');
      router.push('/admin/assets');
    },
    onError: () => {
      toast.error('Failed to reject asset');
    },
  });

  const handleReject = () => {
    if (rejectReason.trim().length < 10) {
      toast.error('Please provide a detailed reason (at least 10 characters)');
      return;
    }
    rejectMutation.mutate(rejectReason);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Asset not found</p>
      </div>
    );
  }

  const proof = asset.proofs[0];
  const ProofIcon = proof ?  proofIcons[proof.type] : FileText;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Asset</h1>
          <p className="mt-1 text-muted-foreground">
            Evaluate asset quality and ownership proof
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/assets')}
          >
            Back to Queue
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                {asset.files.find((f:  any) => f.type === 'PREVIEW' || f.type === 'THUMBNAIL')?.url ? (
                  <Image
                    src={
                      asset.files.find((f: any) => f.type === 'PREVIEW')?.url ||
                      asset. files.find((f: any) => f.type === 'THUMBNAIL')?.url
                    }
                    alt={asset.title}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No preview available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>{asset.title}</CardTitle>
              <CardDescription>{asset.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Type:</strong> {asset.assetType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Category:</strong> {asset.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Price:</strong> {formatPrice(asset.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>License:</strong> {asset.licenseType}
                  </span>
                </div>
              </div>

              {asset.tags && asset.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {asset.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <Label className="text-sm font-medium">Files</Label>
                <div className="mt-2 space-y-2">
                  {asset.files.map((file: any) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {file.type} - {file.format. toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {file.url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership Proof */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ProofIcon className="h-5 w-5" />
                Ownership Proof
              </CardTitle>
              <CardDescription>
                Creator's verification of ownership
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proof ?  (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Proof Type</Label>
                    <p className="mt-1 text-sm">{proof.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Details</Label>
                    <div className="mt-1 rounded-lg bg-muted p-4">
                      <p className="whitespace-pre-wrap text-sm">{proof.data}</p>
                    </div>
                  </div>
                  {proof.type === 'LINK' && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={proof.data}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Open Link
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No proof provided
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Creator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{asset.owner.name || asset.owner.username}</p>
                <p className="text-sm text-muted-foreground">
                  @{asset.owner.username}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {asset.owner.email}
                </p>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Submitted {formatDate(asset.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Review Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Review Decision</CardTitle>
              <CardDescription>
                Approve or reject this asset submission
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                size="lg"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation. isPending}
              >
                {approveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Asset
                  </>
                )}
              </Button>

              <Button
                variant="destructive"
                className="w-full"
                size="lg"
                onClick={() => setRejectDialogOpen(true)}
                disabled={rejectMutation.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Asset
              </Button>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">
                  <strong>Review Guidelines:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>• Check for copyright violations</li>
                  <li>• Verify ownership proof is legitimate</li>
                  <li>• Ensure quality meets standards</li>
                  <li>• Review file completeness</li>
                  <li>• Check for inappropriate content</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a detailed reason for rejection.  This will be sent
              to the creator. 
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Explain why this asset cannot be approved..."
              rows={5}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Minimum 10 characters required
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive hover: bg-destructive/90"
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ?  (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Asset'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}