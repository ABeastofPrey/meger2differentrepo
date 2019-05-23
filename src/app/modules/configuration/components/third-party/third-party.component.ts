import { Component, OnInit } from '@angular/core';

const GOOGLE_MIT = `The MIT License

                    Copyright (c) 2010-2019 Google LLC. http://angular.io/license

                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:

                    The above copyright notice and this permission notice shall be included in
                    all copies or substantial portions of the Software.

                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                    THE SOFTWARE.`;
const NGX_MIT   = `Copyright (c) 2018 Olivier Combe

                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

                    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;
const ARE_MIT   = `The MIT License (MIT)

                    Copyright (c) 2016 Matt Lewis

                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:

                    The above copyright notice and this permission notice shall be included in all
                    copies or substantial portions of the Software.

                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                    SOFTWARE.`;
const APACHE    = `Apache-2.0
                                                Apache License
                                          Version 2.0, January 2004
                                       http://www.apache.org/licenses/

                  TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

                  1. Definitions.

                     "License" shall mean the terms and conditions for use, reproduction,
                     and distribution as defined by Sections 1 through 9 of this document.

                     "Licensor" shall mean the copyright owner or entity authorized by
                     the copyright owner that is granting the License.

                     "Legal Entity" shall mean the union of the acting entity and all
                     other entities that control, are controlled by, or are under common
                     control with that entity. For the purposes of this definition,
                     "control" means (i) the power, direct or indirect, to cause the
                     direction or management of such entity, whether by contract or
                     otherwise, or (ii) ownership of fifty percent (50%) or more of the
                     outstanding shares, or (iii) beneficial ownership of such entity.

                     "You" (or "Your") shall mean an individual or Legal Entity
                     exercising permissions granted by this License.

                     "Source" form shall mean the preferred form for making modifications,
                     including but not limited to software source code, documentation
                     source, and configuration files.

                     "Object" form shall mean any form resulting from mechanical
                     transformation or translation of a Source form, including but
                     not limited to compiled object code, generated documentation,
                     and conversions to other media types.

                     "Work" shall mean the work of authorship, whether in Source or
                     Object form, made available under the License, as indicated by a
                     copyright notice that is included in or attached to the work
                     (an example is provided in the Appendix below).

                     "Derivative Works" shall mean any work, whether in Source or Object
                     form, that is based on (or derived from) the Work and for which the
                     editorial revisions, annotations, elaborations, or other modifications
                     represent, as a whole, an original work of authorship. For the purposes
                     of this License, Derivative Works shall not include works that remain
                     separable from, or merely link (or bind by name) to the interfaces of,
                     the Work and Derivative Works thereof.

                     "Contribution" shall mean any work of authorship, including
                     the original version of the Work and any modifications or additions
                     to that Work or Derivative Works thereof, that is intentionally
                     submitted to Licensor for inclusion in the Work by the copyright owner
                     or by an individual or Legal Entity authorized to submit on behalf of
                     the copyright owner. For the purposes of this definition, "submitted"
                     means any form of electronic, verbal, or written communication sent
                     to the Licensor or its representatives, including but not limited to
                     communication on electronic mailing lists, source code control systems,
                     and issue tracking systems that are managed by, or on behalf of, the
                     Licensor for the purpose of discussing and improving the Work, but
                     excluding communication that is conspicuously marked or otherwise
                     designated in writing by the copyright owner as "Not a Contribution."

                     "Contributor" shall mean Licensor and any individual or Legal Entity
                     on behalf of whom a Contribution has been received by Licensor and
                     subsequently incorporated within the Work.

                  2. Grant of Copyright License. Subject to the terms and conditions of
                     this License, each Contributor hereby grants to You a perpetual,
                     worldwide, non-exclusive, no-charge, royalty-free, irrevocable
                     copyright license to reproduce, prepare Derivative Works of,
                     publicly display, publicly perform, sublicense, and distribute the
                     Work and such Derivative Works in Source or Object form.

                  3. Grant of Patent License. Subject to the terms and conditions of
                     this License, each Contributor hereby grants to You a perpetual,
                     worldwide, non-exclusive, no-charge, royalty-free, irrevocable
                     (except as stated in this section) patent license to make, have made,
                     use, offer to sell, sell, import, and otherwise transfer the Work,
                     where such license applies only to those patent claims licensable
                     by such Contributor that are necessarily infringed by their
                     Contribution(s) alone or by combination of their Contribution(s)
                     with the Work to which such Contribution(s) was submitted. If You
                     institute patent litigation against any entity (including a
                     cross-claim or counterclaim in a lawsuit) alleging that the Work
                     or a Contribution incorporated within the Work constitutes direct
                     or contributory patent infringement, then any patent licenses
                     granted to You under this License for that Work shall terminate
                     as of the date such litigation is filed.

                  4. Redistribution. You may reproduce and distribute copies of the
                     Work or Derivative Works thereof in any medium, with or without
                     modifications, and in Source or Object form, provided that You
                     meet the following conditions:

                     (a) You must give any other recipients of the Work or
                         Derivative Works a copy of this License; and

                     (b) You must cause any modified files to carry prominent notices
                         stating that You changed the files; and

                     (c) You must retain, in the Source form of any Derivative Works
                         that You distribute, all copyright, patent, trademark, and
                         attribution notices from the Source form of the Work,
                         excluding those notices that do not pertain to any part of
                         the Derivative Works; and

                     (d) If the Work includes a "NOTICE" text file as part of its
                         distribution, then any Derivative Works that You distribute must
                         include a readable copy of the attribution notices contained
                         within such NOTICE file, excluding those notices that do not
                         pertain to any part of the Derivative Works, in at least one
                         of the following places: within a NOTICE text file distributed
                         as part of the Derivative Works; within the Source form or
                         documentation, if provided along with the Derivative Works; or,
                         within a display generated by the Derivative Works, if and
                         wherever such third-party notices normally appear. The contents
                         of the NOTICE file are for informational purposes only and
                         do not modify the License. You may add Your own attribution
                         notices within Derivative Works that You distribute, alongside
                         or as an addendum to the NOTICE text from the Work, provided
                         that such additional attribution notices cannot be construed
                         as modifying the License.

                     You may add Your own copyright statement to Your modifications and
                     may provide additional or different license terms and conditions
                     for use, reproduction, or distribution of Your modifications, or
                     for any such Derivative Works as a whole, provided Your use,
                     reproduction, and distribution of the Work otherwise complies with
                     the conditions stated in this License.

                  5. Submission of Contributions. Unless You explicitly state otherwise,
                     any Contribution intentionally submitted for inclusion in the Work
                     by You to the Licensor shall be under the terms and conditions of
                     this License, without any additional terms or conditions.
                     Notwithstanding the above, nothing herein shall supersede or modify
                     the terms of any separate license agreement you may have executed
                     with Licensor regarding such Contributions.

                  6. Trademarks. This License does not grant permission to use the trade
                     names, trademarks, service marks, or product names of the Licensor,
                     except as required for reasonable and customary use in describing the
                     origin of the Work and reproducing the content of the NOTICE file.

                  7. Disclaimer of Warranty. Unless required by applicable law or
                     agreed to in writing, Licensor provides the Work (and each
                     Contributor provides its Contributions) on an "AS IS" BASIS,
                     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
                     implied, including, without limitation, any warranties or conditions
                     of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
                     PARTICULAR PURPOSE. You are solely responsible for determining the
                     appropriateness of using or redistributing the Work and assume any
                     risks associated with Your exercise of permissions under this License.

                  8. Limitation of Liability. In no event and under no legal theory,
                     whether in tort (including negligence), contract, or otherwise,
                     unless required by applicable law (such as deliberate and grossly
                     negligent acts) or agreed to in writing, shall any Contributor be
                     liable to You for damages, including any direct, indirect, special,
                     incidental, or consequential damages of any character arising as a
                     result of this License or out of the use or inability to use the
                     Work (including but not limited to damages for loss of goodwill,
                     work stoppage, computer failure or malfunction, or any and all
                     other commercial damages or losses), even if such Contributor
                     has been advised of the possibility of such damages.

                  9. Accepting Warranty or Additional Liability. While redistributing
                     the Work or Derivative Works thereof, You may choose to offer,
                     and charge a fee for, acceptance of support, warranty, indemnity,
                     or other liability obligations and/or rights consistent with this
                     License. However, in accepting such obligations, You may act only
                     on Your own behalf and on Your sole responsibility, not on behalf
                     of any other Contributor, and only if You agree to indemnify,
                     defend, and hold each Contributor harmless for any liability
                     incurred by, or claims asserted against, such Contributor by reason
                     of your accepting any such warranty or additional liability.

                  END OF TERMS AND CONDITIONS

                  APPENDIX: How to apply the Apache License to your work.

                     To apply the Apache License to your work, attach the following
                     boilerplate notice, with the fields enclosed by brackets "{}"
                     replaced with your own identifying information. (Don't include
                     the brackets!)  The text should be enclosed in the appropriate
                     comment syntax for the file format. We also recommend that a
                     file or class name and description of purpose be included on the
                     same "printed page" as the copyright notice for easier
                     identification within third-party archives.

                  Copyright {yyyy} {name of copyright owner}

                  Licensed under the Apache License, Version 2.0 (the "License");
                  you may not use this file except in compliance with the License.
                  You may obtain a copy of the License at

                      http://www.apache.org/licenses/LICENSE-2.0

                  Unless required by applicable law or agreed to in writing, software
                  distributed under the License is distributed on an "AS IS" BASIS,
                  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                  See the License for the specific language governing permissions and
                  limitations under the License.`;
const A2D_MIT   = `MIT License

                    Copyright (c) 2017 Xie, Ziyu

                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:

                    The above copyright notice and this permission notice shall be included in all
                    copies or substantial portions of the Software.

                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                    SOFTWARE.`;
const QR_MIT    = `The MIT License (MIT)
                    ---------------------
                    Copyright (c) 2018 - present Andreas Jacob (Cordobo)

                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:

                    The above copyright notice and this permission notice shall be included in
                    all copies or substantial portions of the Software.

                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                    THE SOFTWARE.`;
const CJS_MIT   = `Copyright (c) 2014-2019 Denis Pushkarev

                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:

                    The above copyright notice and this permission notice shall be included in
                    all copies or substantial portions of the Software.

                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                    THE SOFTWARE.`;
const CRJS_MIT  = `# License

                    [The MIT License (MIT)](http://opensource.org/licenses/MIT)

                    Copyright (c) 2009-2013 Jeff Mott  
                    Copyright (c) 2013-2016 Evan Vosberg

                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:

                    The above copyright notice and this permission notice shall be included in
                    all copies or substantial portions of the Software.

                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                    THE SOFTWARE.`;
const HJS_MIT   = `The MIT License (MIT)

                    Copyright (C) 2011-2014 by Jorik Tangelder (Eight Media)

                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:

                    The above copyright notice and this permission notice shall be included in
                    all copies or substantial portions of the Software.

                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                    THE SOFTWARE.`;
const JUI_DIST_MIT = `Copyright jQuery Foundation and other contributors, https://jquery.org/

                    This software consists of voluntary contributions made by many
                    individuals. For exact contribution history, see the revision history
                    available at https://github.com/jquery/jquery-ui

                    The following license applies to all parts of this software except as
                    documented below:

                    ====

                    Permission is hereby granted, free of charge, to any person obtaining
                    a copy of this software and associated documentation files (the
                    "Software"), to deal in the Software without restriction, including
                    without limitation the rights to use, copy, modify, merge, publish,
                    distribute, sublicense, and/or sell copies of the Software, and to
                    permit persons to whom the Software is furnished to do so, subject to
                    the following conditions:

                    The above copyright notice and this permission notice shall be
                    included in all copies or substantial portions of the Software.

                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
                    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
                    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
                    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
                    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
                    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
                    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

                    ====

                    Copyright and related rights for sample code are waived via CC0. Sample
                    code is defined as all source code contained within the demos directory.

                    CC0: http://creativecommons.org/publicdomain/zero/1.0/

                    ====

                    All files located in the node_modules and external directories are
                    externally maintained libraries used by this software which have their
                    own licenses; we recommend you read them, as their terms may differ from
                    the terms above.`;
const NGC_OUT_MIT = `The MIT License (MIT)

                      Copyright (c) 2016 Eugene Cheung

                      Permission is hereby granted, free of charge, to any person obtaining a copy
                      of this software and associated documentation files (the "Software"), to deal
                      in the Software without restriction, including without limitation the rights
                      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                      copies of the Software, and to permit persons to whom the Software is
                      furnished to do so, subject to the following conditions:

                      The above copyright notice and this permission notice shall be included in
                      all copies or substantial portions of the Software.

                      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                      THE SOFTWARE.`;
const NGX_SCROLL_MIT = `MIT License

                      Copyright (c) 2018 Murhaf Sousli

                      Permission is hereby granted, free of charge, to any person obtaining a copy
                      of this software and associated documentation files (the "Software"), to deal
                      in the Software without restriction, including without limitation the rights
                      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                      copies of the Software, and to permit persons to whom the Software is
                      furnished to do so, subject to the following conditions:

                      The above copyright notice and this permission notice shall be included in all
                      copies or substantial portions of the Software.

                      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                      SOFTWARE.`;
const NGX_TOUR_MIT = `Copyright 2017 Isaac Mann <isaacplmann@gmail.com>

                      Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

                      The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

                      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;
const QRCODEJS2_MIT = `The MIT License (MIT)
                      ---------------------
                      Copyright (c) 2012 davidshimjs

                      Permission is hereby granted, free of charge,
                      to any person obtaining a copy of this software and associated documentation files (the "Software"),
                      to deal in the Software without restriction,
                      including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
                      and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
                      subject to the following conditions:

                      The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

                      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;      
const RAMDA_MIT   = `The MIT License (MIT)

                      Copyright (c) 2013-2018 Scott Sauyet and Michael Hurley

                      Permission is hereby granted, free of charge, to any person obtaining a copy
                      of this software and associated documentation files (the "Software"), to deal
                      in the Software without restriction, including without limitation the rights
                      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                      copies of the Software, and to permit persons to whom the Software is
                      furnished to do so, subject to the following conditions:

                      The above copyright notice and this permission notice shall be included in
                      all copies or substantial portions of the Software.

                      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
                      THE SOFTWARE.`;
const RAMDA_ADJ_BSD = `BSD 3-Clause License

                        Copyright 2017-2019 Vladimír Gorej and the Ramda Adjunct contributors

                        Redistribution and use in source and binary forms, with or without modification,
                        are permitted provided that the following conditions are met:

                        1. Redistributions of source code must retain the above copyright notice, 
                           this list of conditions and the following disclaimer.

                        2. Redistributions in binary form must reproduce the above copyright notice, 
                           this list of conditions and the following disclaimer in the documentation and/or
                           other materials provided with the distribution.

                        3. Neither the name of the copyright holder nor the names of its contributors may be used
                           to endorse or promote products derived from this software without specific prior written permission.

                        THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
                        INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                        ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
                        INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, 
                        PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
                        HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
                        OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
                        EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`;
const RAMDA_FAN_MIT = `Copyright 2017 Michael Hurley

                        Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

                        The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

                        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;
const RXJS_APACHE   = `Apache-2.0
                                                      Apache License
                                                Version 2.0, January 2004
                                             http://www.apache.org/licenses/

                        TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

                        1. Definitions.

                           "License" shall mean the terms and conditions for use, reproduction,
                           and distribution as defined by Sections 1 through 9 of this document.

                           "Licensor" shall mean the copyright owner or entity authorized by
                           the copyright owner that is granting the License.

                           "Legal Entity" shall mean the union of the acting entity and all
                           other entities that control, are controlled by, or are under common
                           control with that entity. For the purposes of this definition,
                           "control" means (i) the power, direct or indirect, to cause the
                           direction or management of such entity, whether by contract or
                           otherwise, or (ii) ownership of fifty percent (50%) or more of the
                           outstanding shares, or (iii) beneficial ownership of such entity.

                           "You" (or "Your") shall mean an individual or Legal Entity
                           exercising permissions granted by this License.

                           "Source" form shall mean the preferred form for making modifications,
                           including but not limited to software source code, documentation
                           source, and configuration files.

                           "Object" form shall mean any form resulting from mechanical
                           transformation or translation of a Source form, including but
                           not limited to compiled object code, generated documentation,
                           and conversions to other media types.

                           "Work" shall mean the work of authorship, whether in Source or
                           Object form, made available under the License, as indicated by a
                           copyright notice that is included in or attached to the work
                           (an example is provided in the Appendix below).

                           "Derivative Works" shall mean any work, whether in Source or Object
                           form, that is based on (or derived from) the Work and for which the
                           editorial revisions, annotations, elaborations, or other modifications
                           represent, as a whole, an original work of authorship. For the purposes
                           of this License, Derivative Works shall not include works that remain
                           separable from, or merely link (or bind by name) to the interfaces of,
                           the Work and Derivative Works thereof.

                           "Contribution" shall mean any work of authorship, including
                           the original version of the Work and any modifications or additions
                           to that Work or Derivative Works thereof, that is intentionally
                           submitted to Licensor for inclusion in the Work by the copyright owner
                           or by an individual or Legal Entity authorized to submit on behalf of
                           the copyright owner. For the purposes of this definition, "submitted"
                           means any form of electronic, verbal, or written communication sent
                           to the Licensor or its representatives, including but not limited to
                           communication on electronic mailing lists, source code control systems,
                           and issue tracking systems that are managed by, or on behalf of, the
                           Licensor for the purpose of discussing and improving the Work, but
                           excluding communication that is conspicuously marked or otherwise
                           designated in writing by the copyright owner as "Not a Contribution."

                           "Contributor" shall mean Licensor and any individual or Legal Entity
                           on behalf of whom a Contribution has been received by Licensor and
                           subsequently incorporated within the Work.

                        2. Grant of Copyright License. Subject to the terms and conditions of
                           this License, each Contributor hereby grants to You a perpetual,
                           worldwide, non-exclusive, no-charge, royalty-free, irrevocable
                           copyright license to reproduce, prepare Derivative Works of,
                           publicly display, publicly perform, sublicense, and distribute the
                           Work and such Derivative Works in Source or Object form.

                        3. Grant of Patent License. Subject to the terms and conditions of
                           this License, each Contributor hereby grants to You a perpetual,
                           worldwide, non-exclusive, no-charge, royalty-free, irrevocable
                           (except as stated in this section) patent license to make, have made,
                           use, offer to sell, sell, import, and otherwise transfer the Work,
                           where such license applies only to those patent claims licensable
                           by such Contributor that are necessarily infringed by their
                           Contribution(s) alone or by combination of their Contribution(s)
                           with the Work to which such Contribution(s) was submitted. If You
                           institute patent litigation against any entity (including a
                           cross-claim or counterclaim in a lawsuit) alleging that the Work
                           or a Contribution incorporated within the Work constitutes direct
                           or contributory patent infringement, then any patent licenses
                           granted to You under this License for that Work shall terminate
                           as of the date such litigation is filed.

                        4. Redistribution. You may reproduce and distribute copies of the
                           Work or Derivative Works thereof in any medium, with or without
                           modifications, and in Source or Object form, provided that You
                           meet the following conditions:

                           (a) You must give any other recipients of the Work or
                               Derivative Works a copy of this License; and

                           (b) You must cause any modified files to carry prominent notices
                               stating that You changed the files; and

                           (c) You must retain, in the Source form of any Derivative Works
                               that You distribute, all copyright, patent, trademark, and
                               attribution notices from the Source form of the Work,
                               excluding those notices that do not pertain to any part of
                               the Derivative Works; and

                           (d) If the Work includes a "NOTICE" text file as part of its
                               distribution, then any Derivative Works that You distribute must
                               include a readable copy of the attribution notices contained
                               within such NOTICE file, excluding those notices that do not
                               pertain to any part of the Derivative Works, in at least one
                               of the following places: within a NOTICE text file distributed
                               as part of the Derivative Works; within the Source form or
                               documentation, if provided along with the Derivative Works; or,
                               within a display generated by the Derivative Works, if and
                               wherever such third-party notices normally appear. The contents
                               of the NOTICE file are for informational purposes only and
                               do not modify the License. You may add Your own attribution
                               notices within Derivative Works that You distribute, alongside
                               or as an addendum to the NOTICE text from the Work, provided
                               that such additional attribution notices cannot be construed
                               as modifying the License.

                           You may add Your own copyright statement to Your modifications and
                           may provide additional or different license terms and conditions
                           for use, reproduction, or distribution of Your modifications, or
                           for any such Derivative Works as a whole, provided Your use,
                           reproduction, and distribution of the Work otherwise complies with
                           the conditions stated in this License.

                        5. Submission of Contributions. Unless You explicitly state otherwise,
                           any Contribution intentionally submitted for inclusion in the Work
                           by You to the Licensor shall be under the terms and conditions of
                           this License, without any additional terms or conditions.
                           Notwithstanding the above, nothing herein shall supersede or modify
                           the terms of any separate license agreement you may have executed
                           with Licensor regarding such Contributions.

                        6. Trademarks. This License does not grant permission to use the trade
                           names, trademarks, service marks, or product names of the Licensor,
                           except as required for reasonable and customary use in describing the
                           origin of the Work and reproducing the content of the NOTICE file.

                        7. Disclaimer of Warranty. Unless required by applicable law or
                           agreed to in writing, Licensor provides the Work (and each
                           Contributor provides its Contributions) on an "AS IS" BASIS,
                           WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
                           implied, including, without limitation, any warranties or conditions
                           of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
                           PARTICULAR PURPOSE. You are solely responsible for determining the
                           appropriateness of using or redistributing the Work and assume any
                           risks associated with Your exercise of permissions under this License.

                        8. Limitation of Liability. In no event and under no legal theory,
                           whether in tort (including negligence), contract, or otherwise,
                           unless required by applicable law (such as deliberate and grossly
                           negligent acts) or agreed to in writing, shall any Contributor be
                           liable to You for damages, including any direct, indirect, special,
                           incidental, or consequential damages of any character arising as a
                           result of this License or out of the use or inability to use the
                           Work (including but not limited to damages for loss of goodwill,
                           work stoppage, computer failure or malfunction, or any and all
                           other commercial damages or losses), even if such Contributor
                           has been advised of the possibility of such damages.

                        9. Accepting Warranty or Additional Liability. While redistributing
                           the Work or Derivative Works thereof, You may choose to offer,
                           and charge a fee for, acceptance of support, warranty, indemnity,
                           or other liability obligations and/or rights consistent with this
                           License. However, in accepting such obligations, You may act only
                           on Your own behalf and on Your sole responsibility, not on behalf
                           of any other Contributor, and only if You agree to indemnify,
                           defend, and hold each Contributor harmless for any liability
                           incurred by, or claims asserted against, such Contributor by reason
                           of your accepting any such warranty or additional liability.

                        END OF TERMS AND CONDITIONS

                        APPENDIX: How to apply the Apache License to your work.

                           To apply the Apache License to your work, attach the following
                           boilerplate notice, with the fields enclosed by brackets "[]"
                           replaced with your own identifying information. (Don't include
                           the brackets!)  The text should be enclosed in the appropriate
                           comment syntax for the file format. We also recommend that a
                           file or class name and description of purpose be included on the
                           same "printed page" as the copyright notice for easier
                           identification within third-party archives.

                        Copyright (c) 2015-2018 Google, Inc., Netflix, Inc., Microsoft Corp. and contributors

                        Licensed under the Apache License, Version 2.0 (the "License");
                        you may not use this file except in compliance with the License.
                        You may obtain a copy of the License at

                            http://www.apache.org/licenses/LICENSE-2.0

                        Unless required by applicable law or agreed to in writing, software
                        distributed under the License is distributed on an "AS IS" BASIS,
                        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                        See the License for the specific language governing permissions and
                        limitations under the License.`;
const SCR_MIT      = `MIT License

                        Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

                        Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

                        The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

                        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;
const TSLIB_APACHE  = `Apache License

                        Version 2.0, January 2004

                        http://www.apache.org/licenses/ 

                        TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

                        1. Definitions.

                        "License" shall mean the terms and conditions for use, reproduction, and distribution as defined by Sections 1 through 9 of this document.

                        "Licensor" shall mean the copyright owner or entity authorized by the copyright owner that is granting the License.

                        "Legal Entity" shall mean the union of the acting entity and all other entities that control, are controlled by, or are under common control with that entity. For the purposes of this definition, "control" means (i) the power, direct or indirect, to cause the direction or management of such entity, whether by contract or otherwise, or (ii) ownership of fifty percent (50%) or more of the outstanding shares, or (iii) beneficial ownership of such entity.

                        "You" (or "Your") shall mean an individual or Legal Entity exercising permissions granted by this License.

                        "Source" form shall mean the preferred form for making modifications, including but not limited to software source code, documentation source, and configuration files.

                        "Object" form shall mean any form resulting from mechanical transformation or translation of a Source form, including but not limited to compiled object code, generated documentation, and conversions to other media types.

                        "Work" shall mean the work of authorship, whether in Source or Object form, made available under the License, as indicated by a copyright notice that is included in or attached to the work (an example is provided in the Appendix below).

                        "Derivative Works" shall mean any work, whether in Source or Object form, that is based on (or derived from) the Work and for which the editorial revisions, annotations, elaborations, or other modifications represent, as a whole, an original work of authorship. For the purposes of this License, Derivative Works shall not include works that remain separable from, or merely link (or bind by name) to the interfaces of, the Work and Derivative Works thereof.

                        "Contribution" shall mean any work of authorship, including the original version of the Work and any modifications or additions to that Work or Derivative Works thereof, that is intentionally submitted to Licensor for inclusion in the Work by the copyright owner or by an individual or Legal Entity authorized to submit on behalf of the copyright owner. For the purposes of this definition, "submitted" means any form of electronic, verbal, or written communication sent to the Licensor or its representatives, including but not limited to communication on electronic mailing lists, source code control systems, and issue tracking systems that are managed by, or on behalf of, the Licensor for the purpose of discussing and improving the Work, but excluding communication that is conspicuously marked or otherwise designated in writing by the copyright owner as "Not a Contribution."

                        "Contributor" shall mean Licensor and any individual or Legal Entity on behalf of whom a Contribution has been received by Licensor and subsequently incorporated within the Work.

                        2. Grant of Copyright License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form.

                        3. Grant of Patent License. Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable (except as stated in this section) patent license to make, have made, use, offer to sell, sell, import, and otherwise transfer the Work, where such license applies only to those patent claims licensable by such Contributor that are necessarily infringed by their Contribution(s) alone or by combination of their Contribution(s) with the Work to which such Contribution(s) was submitted. If You institute patent litigation against any entity (including a cross-claim or counterclaim in a lawsuit) alleging that the Work or a Contribution incorporated within the Work constitutes direct or contributory patent infringement, then any patent licenses granted to You under this License for that Work shall terminate as of the date such litigation is filed.

                        4. Redistribution. You may reproduce and distribute copies of the Work or Derivative Works thereof in any medium, with or without modifications, and in Source or Object form, provided that You meet the following conditions:

                        You must give any other recipients of the Work or Derivative Works a copy of this License; and

                        You must cause any modified files to carry prominent notices stating that You changed the files; and

                        You must retain, in the Source form of any Derivative Works that You distribute, all copyright, patent, trademark, and attribution notices from the Source form of the Work, excluding those notices that do not pertain to any part of the Derivative Works; and

                        If the Work includes a "NOTICE" text file as part of its distribution, then any Derivative Works that You distribute must include a readable copy of the attribution notices contained within such NOTICE file, excluding those notices that do not pertain to any part of the Derivative Works, in at least one of the following places: within a NOTICE text file distributed as part of the Derivative Works; within the Source form or documentation, if provided along with the Derivative Works; or, within a display generated by the Derivative Works, if and wherever such third-party notices normally appear. The contents of the NOTICE file are for informational purposes only and do not modify the License. You may add Your own attribution notices within Derivative Works that You distribute, alongside or as an addendum to the NOTICE text from the Work, provided that such additional attribution notices cannot be construed as modifying the License. You may add Your own copyright statement to Your modifications and may provide additional or different license terms and conditions for use, reproduction, or distribution of Your modifications, or for any such Derivative Works as a whole, provided Your use, reproduction, and distribution of the Work otherwise complies with the conditions stated in this License.

                        5. Submission of Contributions. Unless You explicitly state otherwise, any Contribution intentionally submitted for inclusion in the Work by You to the Licensor shall be under the terms and conditions of this License, without any additional terms or conditions. Notwithstanding the above, nothing herein shall supersede or modify the terms of any separate license agreement you may have executed with Licensor regarding such Contributions.

                        6. Trademarks. This License does not grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except as required for reasonable and customary use in describing the origin of the Work and reproducing the content of the NOTICE file.

                        7. Disclaimer of Warranty. Unless required by applicable law or agreed to in writing, Licensor provides the Work (and each Contributor provides its Contributions) on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties or conditions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A PARTICULAR PURPOSE. You are solely responsible for determining the appropriateness of using or redistributing the Work and assume any risks associated with Your exercise of permissions under this License.

                        8. Limitation of Liability. In no event and under no legal theory, whether in tort (including negligence), contract, or otherwise, unless required by applicable law (such as deliberate and grossly negligent acts) or agreed to in writing, shall any Contributor be liable to You for damages, including any direct, indirect, special, incidental, or consequential damages of any character arising as a result of this License or out of the use or inability to use the Work (including but not limited to damages for loss of goodwill, work stoppage, computer failure or malfunction, or any and all other commercial damages or losses), even if such Contributor has been advised of the possibility of such damages.

                        9. Accepting Warranty or Additional Liability. While redistributing the Work or Derivative Works thereof, You may choose to offer, and charge a fee for, acceptance of support, warranty, indemnity, or other liability obligations and/or rights consistent with this License. However, in accepting such obligations, You may act only on Your own behalf and on Your sole responsibility, not on behalf of any other Contributor, and only if You agree to indemnify, defend, and hold each Contributor harmless for any liability incurred by, or claims asserted against, such Contributor by reason of your accepting any such warranty or additional liability.

                        END OF TERMS AND CONDITIONS`;
const WITHIN_ISC    = `Copyright (c) 2018, Craig Patik <http://patik.com>

                        Permission to use, copy, modify, and/or distribute this software for any
                        purpose with or without fee is hereby granted, provided that the above
                        copyright notice and this permission notice appear in all copies.

                        THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
                        WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
                        MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
                        ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
                        WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
                        ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
                        OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`;
@Component({
  selector: 'app-third-party',
  templateUrl: './third-party.component.html',
  styleUrls: ['./third-party.component.css']
})
export class ThirdPartyComponent implements OnInit {
  
  libs: Library[] = [];
  
  private getAngularMITLicenses(list: string[]) : Library[] {
    let result: Library[] = [];
    for (let s of list) {
      result.push({
        name: s,
        license: GOOGLE_MIT
      });
    }
    return result;
  }

  constructor() { }

  ngOnInit() {
    // Angular
    this.libs.push(...this.getAngularMITLicenses([
      '@angular/animations','@angular/cdk','@angular/common','@angular/core',
      '@angular/material','@angular/platform-browser','@angular/router',
      'zone.js'
    ]));
    // ngx-translate
    this.libs.push(...[{
      name: '@ngx-translate/core',
      license: NGX_MIT
    },{
      name: '@ngx-translate/http-loader',
      license: NGX_MIT
    }]);
    // angular-resizable-element
    this.libs.push({
      name: '@angular-resizable-element',
      license: ARE_MIT
    });
    // angular-split
    this.libs.push({
      name: 'angular-split',
      license: APACHE
    });
    // angular2-draggable
    this.libs.push({
      name: 'angular2-draggable',
      license: A2D_MIT
    });
    // angularx-qrcode
    this.libs.push({
      name: 'angularx-qrcode',
      license: QR_MIT
    });
    //core-js
    this.libs.push({
      name: 'core-js',
      license: CJS_MIT
    });
    //crypto-js
    this.libs.push({
      name: 'crypto-js',
      license: CRJS_MIT
    });
    // hammerjs
    this.libs.push({
      name: 'hammerjs',
      license: HJS_MIT
    });
    // jquery-ui-dist
    this.libs.push({
      name: 'jquery-ui-dist',
      license: JUI_DIST_MIT
    });
    //ng-click-outside
    this.libs.push({
      name: 'ng-click-outside',
      license: NGC_OUT_MIT
    });
    // ngx-scrollbar
    this.libs.push({
      name: 'ngx-scrollbar',
      license: NGX_SCROLL_MIT
    });
    // ngx-tour-core
    this.libs.push({
      name: 'ngx-tour-core',
      license: NGX_TOUR_MIT
    });
    // ngx-tour-md-menu
    this.libs.push({
      name: 'ngx-tour-md-menu',
      license: NGX_TOUR_MIT
    });
    // qrcodejs2
    this.libs.push({
      name: 'qrcodejs2',
      license: QRCODEJS2_MIT
    });
    // ramda
    this.libs.push({
      name: 'ramda',
      license: RAMDA_MIT
    });
    // ramda-adjunct
    this.libs.push({
      name: 'ramda-adjunct',
      license: RAMDA_ADJ_BSD
    });
    // ramda-fantasy
    this.libs.push({
      name: 'ramda-fantasy',
      license: RAMDA_FAN_MIT
    });
    // rxjs
    this.libs.push({
      name: 'rxjs',
      license: RXJS_APACHE
    });
    // rxjs-compat
    this.libs.push({
      name: 'rxjs-compat',
      license: RXJS_APACHE
    });
    // screenfull
    this.libs.push({
      name: 'screenfull',
      license: SCR_MIT
    });
    // tslib
    this.libs.push({
      name: 'tslib',
      license: TSLIB_APACHE
    });
    // withinviewport
    this.libs.push({
      name: 'withinviewport',
      license: WITHIN_ISC
    });
    
  }

}

interface Library {
  name: string;
  license: string;
}